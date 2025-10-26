# Active Context

## Current Focus
- Establish Memory Bank as source of truth.
- Validate end‑to‑end flow on local dev and confirm deploy path to GitHub Pages.
- Add alternative translation provider (LibreTranslate) and selection in Settings.

## Recent Changes
- Implemented: OAuth (Implicit), Helix helpers, IRC WebSocket client, language detection with `franc-min`, translation adapter (OpenAI), basic UI and settings.

## Next Steps
- Decide whether to keep Implicit Grant or migrate to Authorization Code + PKCE (still client‑side compatible, but more work).
- Optional: Additional adapters (e.g., Google, DeepL) behind the same provider switch.
- Optional: Add badges for stream tags and clearer primary language state.
- Add minimal docs for GitHub Pages deployment workflow and Twitch app setup (redirect URI, scopes).

## Decisions & Preferences
- Keep app entirely static and portable; no backend introduced.
- Prioritize fast load and minimal dependencies.

## Insights
- Using Twitch `stream.language` combined with a rolling majority detector yields a stable primary language quickly.
- Translating only when primary language ≠ English reduces cost and avoids over‑translation of mixed‑language chats.
