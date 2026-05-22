const ALADIN_API = 'http://www.aladin.co.kr/ttb/api/ItemList.aspx';
const TTB_KEY = 'ttbbluehhhh1424001';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let data = await fetchAladin('ItemNewSpecial', 20);
    if (!data || !data.item || data.item.length === 0) {
      data = await fetchAladin('ItemEditorChoice', 20);
    }

    let items = data?.item || [];
    items.sort((a, b) => (b.salesPoint || 0) - (a.salesPoint || 0));

    const books = items.map((item, i) => ({
      title: item.title || '',
      author: item.author || '',
      publisher: item.publisher || '',
      year: item.pubDate ? item.pubDate.substring(0, 4) : '',
      genre: item.categoryName || '',
      summary: item.description || '',
      coverImg: item.cover || '',
      detailUrl: item.link || '',
      salesPoint: item.salesPoint || 0,
      isChoice: i === 0
    }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=3600');
    res.json({ books, count: books.length, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Aladin API error:', err);
    res.status(500).json({ error: 'API failed', message: err.message });
  }
}

async function fetchAladin(queryType, maxResults) {
  const params = new URLSearchParams({
    ttbkey: TTB_KEY,
    QueryType: queryType,
    MaxResults: String(maxResults),
    start: '1',
    SearchTarget: 'Book',
    output: 'js',
    Version: '20131101'
  });
  const res = await fetch(ALADIN_API + '?' + params);
  if (!res.ok) return null;
  return res.json();
}
