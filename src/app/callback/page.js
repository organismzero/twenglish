'use client'

import { useEffect } from 'react'
import { parseFragmentAndStoreToken } from '../../lib/auth'

export default function CallbackPage() {
  useEffect(() => {
    const tok = parseFragmentAndStoreToken()
    if (tok) {
      window.location.replace('/')
    }
  }, [])

  return <div>Completing login…</div>
}
