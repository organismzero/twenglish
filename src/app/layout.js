import Link from 'next/link'
import './globals.css'
import { withBasePath } from '../lib/base-path'

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
      <body suppressHydrationWarning>
        <div className="min-h-screen">
          <header className="border-b border-aquadark-800">
            <div className="container-max flex items-center gap-4 py-4">
              <img src={logoSrc} alt="logo" className="w-8 h-8 rounded-lg" />
              <Link href={withBasePath('/')} prefetch={false} className="text-lg font-semibold hover:opacity-80 transition-opacity">
                Twilingual
              </Link>
              <div className="ml-auto text-sm opacity-70">Dark aquamarine</div>
            </div>
          </header>
          <main className="container-max py-6">{children}</main>
          <footer className="container-max py-10 opacity-70 text-sm">
            Served statically via GitHub Pages on twilingual.com. No server required.
          </footer>
        </div>
      </body>
    </html>
  )
}
