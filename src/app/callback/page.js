'use client'

import { useEffect } from 'react'
import { parseFragmentAndStoreToken } from '../../lib/auth'
import { withBasePath } from '../../lib/base-path'

export default function CallbackPage() {
  useEffect(() => {
    const tok = parseFragmentAndStoreToken()
    if (tok) {
      window.location.replace(withBasePath('/'))
    }
  }, [])

  return <div>Completing login…</div>
}
