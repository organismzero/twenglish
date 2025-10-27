# Tech Context

## Stack
- Next.js 14 (App Router), React 18, TailwindCSS.
- `franc-min` for language detection.
- OpenAI Chat Completions for translation (optional; client‑side key).
- No backend services; static export for GitHub Pages.

## Twitch Integration
- OAuth: Implicit Grant in browser. Redirect URI for production is `https://twilingual.com/callback/`. When deploying under a GitHub Pages subpath, set `NEXT_PUBLIC_BASE_PATH` and adjust the URI accordingly.
- Helix endpoints used: `/users`, `/streams/followed`, `/channels/followed`, `/users?login=`, `/streams`.
- Headers: `Authorization: Bearer <token>`, `Client-Id: <clientId>`.
- IRC: `wss://irc-ws.chat.twitch.tv:443` with CAP tags/commands/membership; anonymous NICK (`justinfan*`) for read‑only.

## Static Hosting
- `next.config.mjs`: `output: 'export'`, `trailingSlash: true`, `basePath` driven by `NEXT_PUBLIC_BASE_PATH` (default `''` for twilingual.com).
- `NEXT_PUBLIC_SITE_URL` defaults OAuth redirect origin; set to `https://twilingual.com` in production.
- Build: `npm run build` → outputs static site in `out/`.

## Storage & Security
- `sessionStorage` keys: Twitch token, Twitch Client ID, OpenAI key/model.
- Keys are not persisted beyond session; users must re‑enter per session.
- Translation is optional; without a key, messages are shown untranslated.

## Limitations / Considerations
- Implicit Grant vs. PKCE: Current implementation uses Implicit for simplicity. PKCE is preferred by OAuth 2.1; consider migration if Twitch’s policies change.
- Translation costs/limits: User is responsible for their provider plan and quotas.
