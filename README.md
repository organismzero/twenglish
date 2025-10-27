# Twilingual

Static Twitch chat client with automatic language detection and **OpenAI translation to English**.

- **Hosting:** GitHub Pages (Next.js static export)
- **Auth:** Twitch OAuth Implicit Grant (no server)
- **Chat:** Twitch IRC over secure WebSocket (anonymous read)
- **Language:** franc-min
- **Translation:** OpenAI (user-provided API key, client-side)
- **Translation:**
  - OpenAI (user-provided API key, client-side)
  - LibreTranslate (user-provided endpoint and optional key)

## Quick start

```bash
npm i
npm run dev
# open http://localhost:3000
```

### Configure (first run)

1. Click **Settings** (top-right).
2. Enter your **Twitch Client ID** (from https://dev.twitch.tv/console/apps).
3. Choose a translation provider in Settings:
   - OpenAI: enter your API key (starts with `sk-...`) and model (e.g., `gpt-4o-mini`).
   - LibreTranslate: enter the server endpoint (e.g., `https://libretranslate.com`) and optional API key.
   If no provider credentials are supplied, messages will not be translated.
4. In your Twitch app, set the OAuth Redirect URLs EXACTLY (must match character-for-character):
   - Development: `http://localhost:3000/callback/`
   - Production (GitHub Pages): `https://<your-username>.github.io/twilingual/callback/`
   Note: The trailing slash is required because this app uses `trailingSlash: true` and the login flow sends `/callback/`.

### Build & deploy to GitHub Pages

1. In `next.config.mjs` the `basePath` is `/twilingual` when `NODE_ENV=production`.
2. Build (Next.js already exports static assets when `output: 'export'`):
   ```bash
   npm run build
   ```
3. The static site is generated in `out/`. Push that to the `gh-pages` branch or enable Pages from `/root` after adding a workflow.
   A minimal workflow example:
   ```yaml
   name: Deploy
   on: push
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 20 }
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with: { path: out }
         - uses: actions/deploy-pages@v4
   ```

### Notes

- **Security:** Your translation provider settings (OpenAI key, LibreTranslate endpoint/key) are stored in `sessionStorage` and used only by your own browser. Viewers need to input their own credentials to enable translation.
- **Scopes:** Only `chat:read` and `user:read:follows` are required.
- **Anonymous IRC:** We connect to chat using an anonymous nick (`justinfan*`), which is permitted for reading public chat.
- **Primary language:** We start with Twitch `stream.language` if available, and refine over time with chat-majority detection. Messages in the primary language are translated to English; English streams show original only.

### Routing note

- For static export compatibility, the chat view uses a query parameter instead of a dynamic segment.
- Chat URL format: `/chat/?login=<channel_login>`

## Customization

- Theme colors are defined under `aquadark` in `tailwind.config.js`.
- Components use Tailwind utility classes for a clean dark aquamarine look.
