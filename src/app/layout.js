import './globals.css'

export const metadata = {
  title: 'Twenglish',
  description: 'Twitch chat translator (GitHub Pages)',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-aquadark-800">
            <div className="container-max flex items-center gap-4 py-4">
              <img src="/icon.svg" alt="logo" className="w-8 h-8 rounded-lg" />
              <div className="text-lg font-semibold">Twenglish</div>
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
