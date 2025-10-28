/**
 * Client-only chat view implementation to keep the dynamic channel page
 * compatible with Next.js static export requirements.
 */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getUsersByLogin, getStreamByUserId } from '../../../lib/helix'
import { TwitchIRC } from '../../../lib/irc'
import { majorityLanguageISO1, detectISO1 } from '../../../lib/detect'
import { translateIfNeeded } from '../../../lib/translate'
import { getTargetLanguage } from '../../../lib/translate/target'
import ChatMessage from '../../../components/ChatMessage'
import SettingsDrawer from '../../../components/SettingsDrawer'
import { withBasePath } from '../../../lib/base-path'

export default function ChatPageInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const paramValue = useMemo(() => {
    const raw = Array.isArray(params?.login) ? params?.login?.[0] : params?.login
    return (raw || '').toString().trim()
  }, [params])
  const queryValue = (searchParams?.get('login') || '').trim()
  const initialLogin = paramValue && paramValue !== '__placeholder__' ? paramValue : queryValue
  const [login, setLogin] = useState(initialLogin)
  const isPlaceholder = !login
  const [primaryLang, setPrimaryLang] = useState(null)
  const [streamTags, setStreamTags] = useState([])
  const [msgs, setMsgs] = useState([])
  const [targetLang, setTargetLang] = useState('en')
  const [avatarUrl, setAvatarUrl] = useState('')
  const bufRef = useRef([])
  const seenRef = useRef(new Set())
  const ircRef = useRef(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    const nextLogin = paramValue && paramValue !== '__placeholder__' ? paramValue : queryValue
    if (nextLogin && nextLogin !== login) {
      setLogin(nextLogin)
    }
  }, [paramValue, queryValue, login])

  useEffect(() => {
    if (!login) return
    if (typeof window === 'undefined') return
    const prettyPath = withBasePath(`/chat/${login}/`)
    const currentPath = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : window.location.pathname + '/'
    if (currentPath !== prettyPath) {
      window.history.replaceState(null, '', prettyPath + window.location.hash)
    }
  }, [login])

  useEffect(() => {
    setTargetLang(getTargetLanguage())
  }, [])

  useEffect(() => {
    if (!login || isPlaceholder) return
    ;(async () => {
      const users = await getUsersByLogin([login])
      const u = users[0]
      if (!u) return
      setAvatarUrl(u.profile_image_url || '')
      const s = await getStreamByUserId(u.id)
      if (s) {
        const streamLang = (s.language || '').toLowerCase()
        setPrimaryLang(streamLang || null)
        setStreamTags(s.tags || [])
      }
      const irc = new TwitchIRC({
        onMessage: async (m) => {
          const iso1 = detectISO1(m.text)
          const msgKey = m.id || `${m.channel}:${m.ts}:${m.user}:${m.text}`
          if (seenRef.current.has(msgKey)) return
          seenRef.current.add(msgKey)
          const fallbackPrimary = (s?.language || '').toLowerCase() || null
          const translation = await translateIfNeeded(m.text, iso1, primaryLang || fallbackPrimary)
          const enhanced = {
            ...m,
            ts: Number(m.ts || m.tags?.['tmi-sent-ts'] || Date.now()),
            lang: iso1,
            translation,
            _key: msgKey,
          }
          setMsgs(prev => [...prev.slice(-300), enhanced])

          bufRef.current.push({ text: m.text })
          if (bufRef.current.length > 60) bufRef.current.shift()
          const maj = majorityLanguageISO1(bufRef.current)
          if (maj) {
            const normalizedMaj = maj.toLowerCase()
            setPrimaryLang(prev => prev || normalizedMaj)
          }
        },
        onState: () => {}
      })
      ircRef.current = irc
      irc.join(login)
    })()
    return () => {
      try { ircRef.current?.part?.(login) } catch {}
      try { ircRef.current?.disconnect?.() } catch {}
      ircRef.current = null
      seenRef.current.clear()
      bufRef.current = []
      setAvatarUrl('')
    }
  }, [login])

  useEffect(() => {
    const el = chatContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [msgs])

  if (!login || isPlaceholder) {
    return (
      <div className="card">No channel specified. Visit a chat via a path like <code>/chat/channelname</code>.</div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="card flex items-center gap-3">
        <button
          className="btn w-10 h-10 rounded-full text-lg leading-none"
          type="button"
          aria-label="Back to channels"
          onClick={()=>router.push(withBasePath('/'))}
        >
          ←
        </button>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${login} avatar`}
            className="w-12 h-12 rounded-2xl object-cover border border-aquadark-700"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-aquadark-800 grid place-items-center uppercase font-bold text-lg">
            {(login||'?')[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold">@{login}</div>
          <div className="text-sm opacity-70">Primary language: <span className="badge">{(primaryLang||'unknown').toUpperCase()}</span></div>
        </div>
        <div className="hidden sm:block text-xs opacity-70">{streamTags?.slice(0,5).join(' • ')}</div>
        <SettingsDrawer onTargetLanguageChange={value => setTargetLang((value || 'en').toLowerCase())} />
      </div>

      <div className="card max-h-[70vh] overflow-y-auto" ref={chatContainerRef}>
        {msgs.map((m, idx) => (
          <ChatMessage
            key={m._key || m.id || m.ts}
            msg={m}
            showOriginal={Boolean(primaryLang && targetLang && primaryLang !== targetLang)}
            index={idx}
          />
        ))}
      </div>
    </div>
  )
}
