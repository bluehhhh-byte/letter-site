export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards, question } = req.body;
  if (!cards || cards.length !== 3) {
    return res.status(400).json({ error: '3 cards required' });
  }

  const hasQuestion = question && question !== '질문없음' && question.trim().length > 0;

  const cardInfo = cards.map((c, i) =>
    `[${c.posName}]
카드: ${c.name} (${c.nameEn})
방향: ${c.reversed ? '역방향' : '정방향'}
타입: ${c.type === 'major' ? '메이저 아르카나' : `${c.suitName} (${c.element})`}
키워드: ${c.keywords || ''}
의미: ${c.meaning}`
  ).join('\n\n');

  const prompt = hasQuestion
    ? `당신은 타로 리더입니다. 아래 정보를 바탕으로 따뜻하고 통찰력 있는 타로 리딩을 한국어로 제공해주세요.

질문: ${question}

선택된 카드 3장:
${cardInfo}

다음 JSON 형식으로만 응답해주세요 (다른 설명 없이 JSON만):
{
  "title": "3-5글자 이내의 리딩 제목",
  "text": "종합 해석 (4-6문장, 따뜻한 어조, 카드들의 연결성을 담아)",
  "detail": "메이저/마이너 수, 방향성, 원소 정보 등 통계 (예: 메이저 1장 · 역방향 1장 · 원소 불 2개 · 물 1개)"
}`
    : `당신은 타로 리더입니다. 질문 없이 찾아온 이를 위해 일반적인 운의 흐름과 카드의 상징에 대한 타로 리딩을 한국어로 제공해주세요.

선택된 카드 3장:
${cardInfo}

다음 JSON 형식으로만 응답해주세요 (다른 설명 없이 JSON만):
{
  "title": "3-5글자 이내의 리딩 제목",
  "text": "종합 해석 (4-6문장, 운의 흐름과 상징 중심으로)",
  "detail": "메이저/마이너 수, 방향성, 원소 정보 등 통계 (예: 메이저 1장 · 역방향 1장 · 원소 불 2개 · 물 1개)"
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
          generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
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
