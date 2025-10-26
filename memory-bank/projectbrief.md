# Project Brief: Twenglish

## Goal
Build a static, browser‑only Twitch chat client that:
- Authenticates the user with Twitch OAuth (client‑side).
- Lists the user’s followed channels and live streams.
- Joins chat for a selected channel via Twitch IRC (WebSocket).
- Determines the stream’s primary language using Twitch metadata and live chat analysis.
- If primary language is English, display messages as‑is.
- If not English, translate each message written in the stream’s primary language into English and show the translation with the original.

## Constraints
- Hosting: GitHub Pages (static export, no server/backend).
- Security: No secrets on the server; everything runs client‑side.
- OAuth: Browser‑side flow; redirect URI must be a GitHub Pages URL.
- Chat: Twitch IRC over secure WebSocket (read‑only, anonymous allowed).
- Translation: Per‑user client‑side API key or client‑side model. No server proxy.

## Success Criteria
- Works entirely from GitHub Pages with minimal setup.
- Smooth OAuth, followed channels listing, and chat join.
- Accurate primary language selection (metadata + chat majority fallback).
- Reliable translation to English when primary language ≠ English.

## Non‑Goals (for initial release)
- Chat sending (edit). Read‑only is sufficient.
- Server‑side token handling, DBs, or queues.

