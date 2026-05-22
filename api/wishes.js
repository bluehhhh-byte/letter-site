import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DB_PATH = join('/tmp', 'wishes.json');
const MAX_WISHES = 200;

function readWishes() {
  try {
    if (existsSync(DB_PATH)) {
      return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('readWishes error:', e);
  }
  return [];
}

function writeWishes(wishes) {
  try {
    writeFileSync(DB_PATH, JSON.stringify(wishes), 'utf-8');
  } catch (e) {
    console.error('writeWishes error:', e);
  }
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const wishes = readWishes();
    return res.json({ wishes, count: wishes.length });
  }

  if (req.method === 'POST') {
    const text = req.body?.text?.trim();
    if (!text) {
      return res.status(400).json({ error: '소원을 입력해주세요.' });
    }

    const wishes = readWishes();
    if (wishes.length >= MAX_WISHES) {
      return res.status(400).json({ error: '별이 가득 찼습니다.' });
    }

    const wish = { text, date: Date.now() };
    wishes.push(wish);
    writeWishes(wishes);

    return res.json({ wish, count: wishes.length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
