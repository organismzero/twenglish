import './globals.css'
import { withBasePath } from '../lib/base-path'

export const metadata = {
  title: 'Twilingual',
  description: 'Twitch chat translator (GitHub Pages)',
}

export default function RootLayout({ children }) {
  const logoSrc = withBasePath('/icon.svg')
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="min-h-screen">
          <header className="border-b border-aquadark-800">
            <div className="container-max flex items-center gap-4 py-4">
              <img src={logoSrc} alt="logo" className="w-8 h-8 rounded-lg" />
              <div className="text-lg font-semibold">Twilingual</div>
              <div className="ml-auto text-sm opacity-70">Dark aquamarine</div>
            </div>
          </header>
          <main className="container-max py-6">{children}</main>
          <footer className="container-max py-10 opacity-70 text-sm">
            Built for static hosting on GitHub Pages. No server required.
          </footer>
        </div>
      </body>
    </html>
  )
}
