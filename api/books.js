import * as cheerio from 'cheerio';

const ALADIN_URL = 'https://www.aladin.co.kr/jiny/wrecommend.aspx?cid=0&type=choice';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(ALADIN_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Aladin page fetch failed', status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const books = [];

    $('.ss_book_box').each((i, el) => {
      if (i >= 20) return false;
      const $el = $(el);
      const itemId = $el.attr('itemId') || '';

      const coverImg = $el.find('.front_cover.i_cover').first().attr('src') || '';

      const title = $el.find('a.bo3').first().text().trim();

      const detailUrl = $el.find('a.bo3').first().attr('href') || '';
      const fullUrl = detailUrl.startsWith('http') ? detailUrl : 'https://www.aladin.co.kr' + detailUrl;

      const ratingText = $el.find('.star_score').first().text().trim();
      const rating = parseFloat(ratingText) || 0;

      const infoItems = $el.find('.ss_book_list').first().find('li');
      let author = '';
      let publisher = '';
      let pubDate = '';
      if (infoItems.length >= 3) {
        const authorRaw = $(infoItems[2]).text().trim();
        const authorMatch = authorRaw.match(/^(.+?)\s*\(/);
        if (authorMatch) {
          author = authorMatch[1].trim();
        } else {
          author = authorRaw.split('|')[0]?.trim() || '';
        }
        const parts = authorRaw.split('|').map(s => s.trim());
        if (parts.length >= 2) publisher = parts[1];
        if (parts.length >= 3) pubDate = parts[2];
      }

      const isChoice = $el.find('.choice_label').length > 0;

      books.push({
        itemId,
        title,
        author,
        publisher,
        pubDate,
        coverImg,
        rating,
        detailUrl: fullUrl,
        isChoice
      });
    });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=3600');
    res.json({ books, count: books.length, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Books crawl error:', err);
    res.status(500).json({ error: 'Crawl failed', message: err.message });
  }
}
