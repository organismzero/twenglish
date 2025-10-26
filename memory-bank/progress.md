# Progress

## What Works
- OAuth login (Implicit Grant) with token parsing/validation.
- Followed streams/channels listing via Helix.
- Join channel chat via IRC WebSocket (anonymous read‑only nick).
- Per‑message language detection and rolling majority primary language.
- Conditional translation to English through:
  - OpenAI (per‑user key, client‑side), or
  - LibreTranslate (user‑provided endpoint and optional key).
- Next.js static export configured for GitHub Pages basePath.

## What’s Left
- Optional: PKCE migration for OAuth.
- Optional: Additional translation adapters.
- Optional: UI polish for language and tag indicators.
- CI for Pages deployment (if desired in this repo).

## Known Issues
- Implicit Grant may be less future‑proof than PKCE.
- Client‑side translation keys are user‑provided and ephemeral; suitable for personal use only.
- Language detection is heuristic and may misclassify short/emoji‑heavy messages.

## Status
- MVP complete and suitable for personal deployment to GitHub Pages.
