import Link from 'next/link'
import './globals.css'
import { withBasePath } from '../lib/base-path'

const isProduction = process.env.NODE_ENV === 'production'

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  [
    'connect-src',
    "'self'",
    'https://api.twitch.tv',
    'https://id.twitch.tv',
    'https://static-cdn.jtvnw.net',
    'https://api.betterttv.net',
    'https://7tv.io',
    'https://cdn.7tv.app',
    'https://api.openai.com',
    'https://libretranslate.com',
    'wss://irc-ws.chat.twitch.tv',
  ].join(' '),
  isProduction
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "base-uri 'self'",
  "form-action 'self'",
]

const CSP = CSP_DIRECTIVES.join('; ')

const faviconUrl = withBasePath('/icon.svg')

export const metadata = {
  title: 'Twilingual',
  description: 'Live chat, any language. Translate Twitch chat in real time.',
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
}

export default function RootLayout({ children }) {
  const logoSrc = faviconUrl
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CSP} />
        <meta name="referrer" content="same-origin" />
      </head>
      <body suppressHydrationWarning>
        <div className="min-h-screen">
          <header className="border-b border-aquadark-800">
            <div className="container-max flex items-center gap-4 py-4">
              <img src={logoSrc} alt="logo" className="w-8 h-8 rounded-lg" />
              <Link href={withBasePath('/')} prefetch={false} className="text-lg font-semibold hover:opacity-80 transition-opacity">
                Twilingual
              </Link>
              {/* <div className="ml-auto text-sm opacity-70">Dark aquamarine</div> */}
            </div>
          </header>
          <main className="container-max py-6">{children}</main>
          <footer className="container-max py-10 opacity-70 text-sm space-y-2">
            <div>Served statically via GitHub Pages on twilingual.com. No server required.</div>
            <div>
              A collaboration between{' '}
              <a
                href="https://twitch.com/organismzero"
                target="_blank"
                rel="noreferrer"
                className="underline hover:opacity-80"
              >
                OrganismZero
              </a>{' '}and AI.
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
