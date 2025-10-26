'use client'

import { useEffect, useRef, useState } from 'react'
import { getUsersByLogin, getStreamByUserId } from '../../../lib/helix'
import { TwitchIRC } from '../../../lib/irc'
import { majorityLanguageISO1, detectISO1 } from '../../../lib/detect'
import { translateIfNeeded } from '../../../lib/translate'
import ChatMessage from '../../../components/ChatMessage'
import SettingsDrawer from '../../../components/SettingsDrawer'

export default function ChatPage({ params }) {
  const { login } = params
  const [channel, setChannel] = useState(null)
  const [primaryLang, setPrimaryLang] = useState(null)
  const [streamTags, setStreamTags] = useState([])
  const [msgs, setMsgs] = useState([])
  const bufRef = useRef([])
  const ircRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      const users = await getUsersByLogin([login])
      const u = users[0]
      if (!u) return
      setChannel(u)
      const s = await getStreamByUserId(u.id)
      if (s) {
        setPrimaryLang(s.language || null)
        setStreamTags(s.tags || [])
      }
      // connect IRC
      const irc = new TwitchIRC({
        onMessage: async (m) => {
          // Detect per-message language
          const iso1 = detectISO1(m.text)
          // Maybe translate
          const translation = await translateIfNeeded(m.text, iso1, primaryLang || (s?.language || null))
          const enhanced = { ...m, lang: iso1, translation }
          setMsgs(prev => [...prev.slice(-300), enhanced])

          // maintain buffer for majority
          bufRef.current.push({ text: m.text })
          if (bufRef.current.length > 60) bufRef.current.shift()
          const maj = majorityLanguageISO1(bufRef.current)
          if (maj) setPrimaryLang(prev => prev || maj) // if unknown, adopt maj
        },
        onState: (st) => {}
      })
      ircRef.current = irc
      irc.join(login)
    })()
    return () => {
      ircRef.current?.part?.(login)
    }
  }, [login])

  return (
    <div className="grid gap-4">
      <div className="card flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-aquadark-800 grid place-items-center uppercase font-bold">{(login||'?')[0]}</div>
        <div className="flex-1">
          <div className="font-semibold">@{login}</div>
          <div className="text-sm opacity-70">Primary language: <span className="badge">{(primaryLang||'unknown').toUpperCase()}</span></div>
        </div>
        <div className="hidden sm:block text-xs opacity-70">{streamTags?.slice(0,5).join(' • ')}</div>
        <SettingsDrawer />
      </div>

      <div className="card max-h-[70vh] overflow-y-auto">
        {msgs.map(m => (
          <ChatMessage key={m.id || m.ts} msg={m} showOriginal={primaryLang && primaryLang !== 'en'} />
        ))}
      </div>
    </div>
  )
}
