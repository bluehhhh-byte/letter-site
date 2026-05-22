export default async function handler(req, res) {
  const url = req.query.url;
  if (!url || !url.startsWith('https://image.aladin.co.kr/')) {
    return res.status(400).json({ error: 'Invalid url' });
  }
  try {
    const img = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.aladin.co.kr/'
      }
    });
    if (!img.ok) {
      return res.status(502).json({ error: 'Image fetch failed' });
    }
    const buffer = Buffer.from(await img.arrayBuffer());
    const contentType = img.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
