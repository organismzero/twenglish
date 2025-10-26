# Twenglish

Static Twitch chat client with automatic language detection and **OpenAI translation to English**.

- **Hosting:** GitHub Pages (Next.js static export)
- **Auth:** Twitch OAuth Implicit Grant (no server)
- **Chat:** Twitch IRC over secure WebSocket (anonymous read)
- **Language:** franc-min
- **Translation:** OpenAI (user-provided API key, client-side)

## Quick start

```bash
npm i
npm run dev
# open http://localhost:3000
```

### Configure (first run)

1. Click **Settings** (top-right).
2. Enter your **Twitch Client ID** (from https://dev.twitch.tv/console/apps).
3. Enter your **OpenAI API key** (starts with `sk-...`). Optional; without it, messages won't be translated.
4. In your Twitch app, set the OAuth Redirect URLs EXACTLY (must match character-for-character):
   - Development: `http://localhost:3000/callback/`
   - Production (GitHub Pages): `https://<your-username>.github.io/twenglish/callback/`
   Note: The trailing slash is required because this app uses `trailingSlash: true` and the login flow sends `/callback/`.

### Build & deploy to GitHub Pages

1. In `next.config.mjs` the `basePath` is `/twenglish` when `NODE_ENV=production`.
2. Build and export:
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

- **Security:** Your OpenAI key is stored in `sessionStorage` and used only by your own browser; do not share your deployed site publicly with this enabled—viewers would need to input their own keys.
- **Scopes:** Only `chat:read` and `user:read:follows` are required.
- **Anonymous IRC:** We connect to chat using an anonymous nick (`justinfan*`), which is permitted for reading public chat.
- **Primary language:** We start with Twitch `stream.language` if available, and refine over time with chat-majority detection. Messages in the primary language are translated to English; English streams show original only.

## Customization

- Theme colors are defined under `aquadark` in `tailwind.config.js`.
- Components use Tailwind utility classes for a clean dark aquamarine look.
