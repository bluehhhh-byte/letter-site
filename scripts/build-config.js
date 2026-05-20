const fs = require('fs');
const path = require('path');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const content = `const GEMINI_API_KEY = ${JSON.stringify(apiKey)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'config.js'), content, 'utf-8');
console.log('config.js generated from GEMINI_API_KEY');
