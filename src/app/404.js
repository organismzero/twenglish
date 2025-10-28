'use client'

import { useEffect } from 'react'
import { withBasePath } from '../lib/base-path'

export default function NotFoundRedirect() {
  useEffect(() => {
    const { pathname, search, hash } = window.location
    const chatPrefix = withBasePath('/chat/')
    const basePath = withBasePath('/')

    if (pathname.startsWith(chatPrefix)) {
      const loginSlug = pathname.slice(chatPrefix.length).replace(/\/+$/, '')
      if (loginSlug && loginSlug !== '__placeholder__') {
        const params = new URLSearchParams(search)
        params.set('login', loginSlug)
        const target = `${chatPrefix}__placeholder__/?${params.toString()}${hash || ''}`
        window.location.replace(target)
        return
      }
    }

    if (pathname !== basePath) {
      window.location.replace(basePath)
    }
  }, [])

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="card">Redirecting…</div>
    </div>
  )
}
