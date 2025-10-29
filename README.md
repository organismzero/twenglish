# Twilingual

Live chat, any language. Translate Twitch chat in real time.

Static Twitch chat client with automatic language detection and **OpenAI translation.**.

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
   - Production (custom domain): `https://twilingual.com/callback/`
   - If you deploy under a GitHub Pages subpath, set `NEXT_PUBLIC_BASE_PATH=/your-repo` and use `https://<your-username>.github.io/<your-repo>/callback/`
   Note: The trailing slash is required because this app uses `trailingSlash: true` and the login flow sends `/callback/`.
5. Set `NEXT_PUBLIC_SITE_URL=https://twilingual.com` in your deployment environment so OAuth redirects always point at the custom domain (see the Actions workflow for an example).

### Build & deploy to GitHub Pages

1. (Optional) Set `NEXT_PUBLIC_BASE_PATH` if you deploy under a subdirectory (e.g., `NEXT_PUBLIC_BASE_PATH=/your-repo`). Leave it empty for `twilingual.com`.
2. Build (Next.js already exports static assets when `output: 'export'`):
   ```bash
   npm run build
   ```
3. The static site is generated in `out/` plus `.nojekyll` and `CNAME` (copied by the postbuild script). The repo already includes an Actions workflow at `.github/workflows/deploy.yml` that builds with `npm run build`, injects `NEXT_PUBLIC_SITE_URL=https://twilingual.com`, and deploys to GitHub Pages.

### Notes

- **Security:** Your translation provider settings (OpenAI key, LibreTranslate endpoint/key) are stored in `sessionStorage` and used only by your own browser. Viewers need to input their own credentials to enable translation.
- **Headers:** The exported site embeds a Content Security Policy via `<meta http-equiv>` (dev mode relaxes `script-src` for React refresh). Configure HTTPS/HSTS, `frame-ancestors`, `Permissions-Policy`, `X-Content-Type-Options`, and other security headers in your hosting layer or reverse proxy.
- **Scopes:** Only `chat:read` and `user:read:follows` are required.
- **Anonymous IRC:** We connect to chat using an anonymous nick (`justinfan*`), which is permitted for reading public chat.
- **Primary language:** We start with Twitch `stream.language` if available, and refine over time with chat-majority detection. Messages in the primary language are translated to English; English streams show original only.

### Routing note

- Chat view lives at `/chat/<channel_login>` for cleaner sharing and direct navigation.

## Customization

- Theme colors are defined under `aquadark` in `tailwind.config.js`.
- Components use Tailwind utility classes for a clean dark aquamarine look.
