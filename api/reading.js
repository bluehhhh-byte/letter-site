export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards, question } = req.body;
  if (!cards || cards.length < 1 || cards.length > 10) {
    return res.status(400).json({ error: '1-10 cards required' });
  }

  const hasQuestion = question && question !== '질문없음' && question.trim().length > 0;

  const cardInfo = cards.map((c, i) =>
    `[카드 ${i+1}: ${c.posName}]
카드: ${c.name} (${c.nameEn})
방향: ${c.reversed ? '역방향' : '정방향'}
타입: ${c.type === 'major' ? '메이저 아르카나' : `${c.suitName} (${c.element})`}
키워드: ${c.keywords || ''}
의미: ${c.meaning}`
  ).join('\n\n');

  const prompt = hasQuestion
    ? `당신은 프로 타로 리더입니다. 아래 정보를 바탕으로 깊이 있고 따뜻한 타로 리딩을 한국어로 작성해주세요.

질문: ${question}

선택된 카드 ${cards.length}장 (${cards.length}장 스프레드):
${cardInfo}

💡 작성 지침:
- **title**: 리딩의 정수를 담은 5~8자 제목
- **text**: 
  · 8~12문장으로 충분히 길고 풍부하게 작성할 것
  · 각 카드의 상징과 위치(포지션)의 의미를 연결지어 설명
  · 카드들 간의 흐름과 관계성(상충, 보완, 강화)을 분석
  · 질문자의 상황에 맞춰 구체적인 조언과 통찰을 포함
  · 따뜻하고 공감적인 어조, 문학적인 표현 사용
- **detail**: 메이저/마이너 수, 정/역방향 비율, 원소 분포 등 통계 (예: 메이저 1장 · 역방향 1장 · 원소 불 2개 · 물 1개)

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이 순수 JSON만):
{
  "title": "5-8자 리딩 제목",
  "text": "상세한 종합 해석 (8-12문장)",
  "detail": "통계 요약"
}`
    : `당신은 프로 타로 리더입니다. 질문 없이 찾아온 이를 위해 일반적인 운의 흐름과 카드의 상징에 대한 타로 리딩을 한국어로 작성해주세요.

선택된 카드 ${cards.length}장 (${cards.length}장 스프레드):
${cardInfo}

💡 작성 지침:
- **title**: 리딩의 정수를 담은 5~8자 제목
- **text**:
  · 8~12문장으로 충분히 길고 풍부하게 작성할 것
  · 각 카드의 상징과 위치(포지션)의 의미를 연결지어 설명
  · 카드들 간의 흐름과 관계성을 분석
  · 현재의 운의 흐름과 앞으로의 방향성에 대한 통찰 포함
  · 따뜻하고 공감적인 어조, 문학적인 표현 사용
- **detail**: 메이저/마이너 수, 정/역방향 비율, 원소 분포 등 통계

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이 순수 JSON만):
{
  "title": "5-8자 리딩 제목",
  "text": "상세한 종합 해석 (8-12문장)",
  "detail": "통계 요약"
}`;

  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCI0PZcPZAW7SYjNxkyfEVaunqa5GZlGF0';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 2048 }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(502).json({ error: `Gemini API error (${response.status})` });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(502).json({ error: 'Empty response from Gemini' });
    }

    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const result = JSON.parse(cleaned);

    res.json({
      title: result.title || '',
      text: result.text || rawText,
      detail: result.detail || ''
    });
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: error.message });
  }
}
