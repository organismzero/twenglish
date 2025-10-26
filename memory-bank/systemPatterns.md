# System Patterns

## Architecture
- SPA (Next.js App Router) with `next export` for static hosting on GitHub Pages.
- Twitch OAuth in the browser; token stored in `sessionStorage`.
- Helix API calls from the browser using `Authorization: Bearer <token>` and `Client-Id: <clientId>`.
- Chat via Twitch IRC over WebSocket (`wss://irc-ws.chat.twitch.tv:443`) using anonymous nick for read‑only.
- Language detection using `franc-min` per message + rolling majority buffer.
- Translation via a pluggable adapter; currently OpenAI Chat Completions API (user‑supplied key in session).

## Critical Flows
1. OAuth → token in URL fragment → validate → store → list followed.
2. Join channel chat (IRC WS) → stream messages → detect per‑message language → conditional translation.
3. Primary language selection: start from Twitch `stream.language`; refine with majority of recent messages.

## Key Decisions
- No backend: use Implicit Grant for OAuth and anonymous IRC for reading.
- Translation requires a user‑provided key (client‑side); avoids server key exposure.
- Store ephemeral values (`token`, keys, clientId) in `sessionStorage` to reduce persistence risk.

## Components
- Settings Drawer: Configure Twitch Client ID and translation provider key/model.
- Home: Login + Followed/Live lists; join chat.
- Chat View: Live message list with optional translation + original.

