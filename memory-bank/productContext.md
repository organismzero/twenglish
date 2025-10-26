# Product Context

## Why
Many Twitch streams and chats are not in English. Viewers who primarily read English want a lightweight way to follow non‑English channels and still understand the conversation without running heavy local models or installing extensions.

## Users
- Twitch viewers who follow channels in multiple languages.
- Users deploying a personal utility on GitHub Pages.

## How It Should Work
1. User opens the site and configures Settings (Twitch Client ID and optional translation provider key).
2. User authenticates with Twitch.
3. App lists followed channels (and a Live tab).
4. User joins a channel’s chat; messages stream in live.
5. App determines the stream’s primary language using Twitch metadata and chat message majority.
6. If primary language is English → show messages as‑is. Otherwise → translate messages in the stream’s primary language to English and show translation + original.

## UX Goals
- Simple, zero‑backend setup for GitHub Pages.
- Clear Settings drawer for user‑provided credentials/keys.
- Fast, readable chat UI with unobtrusive translations.
- Respectful of rate limits; graceful degradation if translation is disabled.

