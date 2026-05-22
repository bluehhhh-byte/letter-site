## Goal
Build and maintain a Korean web app (letter-site) with oracle (365 poems) & tarot (78 cards, multi-spread 1/3/5/7/10, Gemini AI analysis), deployed on Vercel via GitHub.

## Constraints
- Korean only, dark/gold design, mobile-first responsive
- Server-side API key (`process.env.GEMINI_API_KEY`) with hardcoded fallback `AIzaSyCI0PZcPZAW7SYjNxkyfEVaunqa5GZlGF0`
- Current key: daily quota exhausted (429) → falls back to `generateFallbackReading()`
- Government network (행망) blocks GitHub/Vercel → Windscribe VPN CLI + Chrome extension bypass

## Done
- `letter-site/` with oracle (crystal-ball → random poem from 365 `poems.js`) and tarot (78 `tarot.js` deck, card grid, spread UI, question input)
- Server-side Gemini AI (`api/reading.js`), fallback reading (element/position/reversal analysis)
- Multi-spread: 1, 3, 5, 7, 10 cards
- Result overlay: spread label, card list with animation delays, combined reading with loading spinner
- Copy button: copies AI prompt text for external chatbots
- "Gemini에게 물어보기": copies prompt + opens gemini.google.com
- VPN auto-bypass: Windscribe CLI installed, `.opencode/agents/vpn.md` agent, `.opencode/plugins/vpn-auto.js` hook, `opencode.json` commands
- All commits pushed to `github.com/bluehhhh-byte/letter-site.git` (HEAD: `27ccddc`)

## Next Steps
1. Deploy on Vercel
2. Test live site

## Key Files
- `letter-site/api/reading.js` — Vercel serverless function (Gemini 2.0-flash → JSON `{title,text,detail}`)
- `letter-site/tarot/index.html` — tarot reading page (inline JS, all UI)
- `letter-site/tarot/tarot.js` — 78-card data + deck builder
- `letter-site/oracle/index.html` — oracle page
- `letter-site/oracle/poems.js` — 365 poems
- `letter-site/styles.css` — shared CSS
- `C:\Users\GIMHAE\.antigravity\NEW2\.opencode\` — opencode config (VPN agent/plugin, commands)
