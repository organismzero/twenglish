/**
 * Server wrapper for the dynamic chat route. Keeps the page compatible with
 * Next.js static export while delegating all interactivity to the client module.
 */
import { Suspense } from 'react'
import ChatPageInner from './client'

const isDev = process.env.NODE_ENV !== 'production'

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="card">Loading chat…</div>}>
      <ChatPageInner />
    </Suspense>
  )
}

export const dynamic = isDev ? 'force-dynamic' : 'force-static'
export const revalidate = isDev ? 0 : false
export const dynamicParams = isDev

export async function generateStaticParams() {
  if (isDev) return []
  return [{ login: '__placeholder__' }]
}
