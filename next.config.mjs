/** @type {import('next').NextConfig} */
const rawBase = (process.env.NEXT_PUBLIC_BASE_PATH || '').trim()
const normalizedBase = rawBase
  ? `/${rawBase.replace(/^\/+/, '').replace(/\/+$/, '')}`
  : ''
const basePath = normalizedBase === '/' ? '' : normalizedBase

const isProduction = process.env.NODE_ENV === 'production'

const cspDirectives = [
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
  "script-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]

const csp = cspDirectives.join('; ')

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: csp,
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'same-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
]

const nextConfig = {
  ...(isProduction ? { output: 'export' } : {}),
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
