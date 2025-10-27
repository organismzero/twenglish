/**
 * Server wrapper for the dynamic chat route. Keeps the page compatible with
 * Next.js static export while delegating all interactivity to the client module.
 */
import { Suspense } from 'react'
import ChatPageInner from './client'

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="card">Loading chat…</div>}>
      <ChatPageInner />
    </Suspense>
  )
}

export const dynamicParams = false

export function generateStaticParams() {
  return [{ login: '__placeholder__' }]
}
