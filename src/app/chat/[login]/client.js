/**
 * Client-only chat view implementation to keep the dynamic channel page
 * compatible with Next.js static export requirements.
 */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getUsersByLogin, getStreamByUserId, getUser } from '../../../lib/helix'
import { TwitchIRC } from '../../../lib/irc'
import { majorityLanguageISO1, detectISO1 } from '../../../lib/detect'
import { translateIfNeeded } from '../../../lib/translate'
import { getTargetLanguage } from '../../../lib/translate/target'
import {
  getCachedEmotes,
  getEmoteEntry,
  setCachedEmotes,
  needsRefresh,
  fetchBTTVGlobalEmotes,
  fetchBTTVChannelEmotes,
  fetchSevenTVGlobalEmotes,
  fetchSevenTVChannelEmotes,
  fetchTwitchGlobalEmotes,
  fetchTwitchChannelEmotes,
  fetchTwitchUserEmotes,
  mapEmotesByCode,
  mergeEmoteMaps,
  tokenizeMessage,
  mergeTranslationTokens,
} from '../../../lib/emotes'
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
  const [streamTitle, setStreamTitle] = useState('')
  const [streamTitleTranslation, setStreamTitleTranslation] = useState('')
  const [msgs, setMsgs] = useState([])
  const [targetLang, setTargetLang] = useState('en')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [emoteMap, setEmoteMap] = useState({})
  const bufRef = useRef([])
  const seenRef = useRef(new Set())
  const ircRef = useRef(null)
  const chatContainerRef = useRef(null)
  const emoteMapRef = useRef({})

  const ensureTwitchGlobalEmotes = useCallback(async () => {
    if (!needsRefresh('twitch')) return getCachedEmotes('twitch')
    const emotes = await fetchTwitchGlobalEmotes()
    if (emotes.length) setCachedEmotes('twitch', emotes)
    return getCachedEmotes('twitch')
  }, [])

  const ensureProviderEmotes = useCallback(async (provider, fetcher, channelId) => {
    if (!needsRefresh(provider, channelId)) {
      return getCachedEmotes(provider, channelId)
    }
    const data = await fetcher(channelId)
    if (Array.isArray(data) && data.length) {
      setCachedEmotes(provider, data, channelId)
    }
    return getCachedEmotes(provider, channelId)
  }, [])

  const ensureTwitchChannelEmotes = useCallback(async (broadcasterId) => {
    if (!broadcasterId) return []
    if (!needsRefresh('twitch-channel', broadcasterId)) {
      return getCachedEmotes('twitch-channel', broadcasterId)
    }
    const emotes = await fetchTwitchChannelEmotes(broadcasterId)
    if (emotes.length) setCachedEmotes('twitch-channel', emotes, broadcasterId)
    return getCachedEmotes('twitch-channel', broadcasterId)
  }, [])

  const ensureTwitchUserEmotes = useCallback(async (userId) => {
    if (!userId) return []
    const cached = getEmoteEntry('twitch-user', userId)
    if (cached) return cached.emotes || []
    const emotes = await fetchTwitchUserEmotes(userId)
    setCachedEmotes('twitch-user', Array.isArray(emotes) ? emotes : [], userId)
    return Array.isArray(emotes) ? emotes : []
  }, [])

  const buildEmoteMap = useCallback(async (broadcasterId, viewerId) => {
    const [twitchGlobal, bttvGlobal, sevenGlobal] = await Promise.all([
      ensureTwitchGlobalEmotes(),
      ensureProviderEmotes('bttv-global', () => fetchBTTVGlobalEmotes(), undefined),
      ensureProviderEmotes('7tv-global', () => fetchSevenTVGlobalEmotes(), undefined),
    ])

    const [twitchChannel, bttvChannel, sevenChannel, twitchUser] = await Promise.all([
      ensureTwitchChannelEmotes(broadcasterId),
      ensureProviderEmotes('bttv-channel', id => fetchBTTVChannelEmotes(id), broadcasterId),
      ensureProviderEmotes('7tv-channel', id => fetchSevenTVChannelEmotes(id), broadcasterId),
      ensureTwitchUserEmotes(viewerId),
    ])

    const merged = mergeEmoteMaps(
      mapEmotesByCode(twitchGlobal, 'twitch'),
      mapEmotesByCode(twitchChannel, 'twitch'),
      mapEmotesByCode(twitchUser, 'twitch'),
      mapEmotesByCode(bttvGlobal, 'bttv'),
      mapEmotesByCode(bttvChannel, 'bttv'),
      mapEmotesByCode(sevenGlobal, '7tv'),
      mapEmotesByCode(sevenChannel, '7tv'),
    )
    setEmoteMap(merged)
    emoteMapRef.current = merged
    return merged
  }, [ensureTwitchGlobalEmotes, ensureProviderEmotes, ensureTwitchChannelEmotes, ensureTwitchUserEmotes])

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
    emoteMapRef.current = emoteMap
  }, [emoteMap])

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
        setStreamTitle(s.title || '')
      }
      let viewerId = null
      try {
        const viewer = await getUser()
        viewerId = viewer?.id || null
      } catch (err) {
        console.warn('Failed to load viewer for emotes', err)
      }

      await buildEmoteMap(u.id, viewerId)
      const irc = new TwitchIRC({
        onMessage: async (m) => {
          const { textValue, tokens } = tokenizeMessage(m.text, emoteMapRef.current || {})
          const iso1 = detectISO1(m.text)
          const msgKey = m.id || `${m.channel}:${m.ts}:${m.user}:${m.text}`
          if (seenRef.current.has(msgKey)) return
          seenRef.current.add(msgKey)
          const fallbackPrimary = (s?.language || '').toLowerCase() || null
          let translationText = ''
          if (textValue) {
            translationText = await translateIfNeeded(textValue, iso1, primaryLang || fallbackPrimary)
          }
          const translationTokens = translationText
            ? mergeTranslationTokens(tokens, translationText)
            : tokens
          const enhanced = {
            ...m,
            ts: Number(m.ts || m.tags?.['tmi-sent-ts'] || Date.now()),
            lang: iso1,
            translationText,
            tokens,
            translationTokens,
            plainText: textValue,
            _key: msgKey,
          }
          setMsgs(prev => [...prev.slice(-300), enhanced])

          bufRef.current.push({ text: textValue || m.text })
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
      setStreamTitle('')
      setStreamTitleTranslation('')
    }
  }, [login])

  useEffect(() => {
    let cancelled = false
    async function translateTitle() {
      if (!streamTitle) {
        setStreamTitleTranslation('')
        return
      }
      const primary = (primaryLang || '').toLowerCase()
      if (!primary) {
        setStreamTitleTranslation('')
        return
      }
      const sourceIso = (detectISO1(streamTitle) || primary).toLowerCase()
      try {
        const translated = await translateIfNeeded(streamTitle, sourceIso, primary)
        if (cancelled) return
        if (translated && translated !== streamTitle) {
          setStreamTitleTranslation(translated)
        } else {
          setStreamTitleTranslation('')
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Failed to translate stream title', err)
          setStreamTitleTranslation('')
        }
      }
    }
    translateTitle()
    return () => {
      cancelled = true
    }
  }, [streamTitle, primaryLang, targetLang])

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
      <div className="card space-y-3">
        <div className="space-y-1">
          {!streamTitleTranslation && (
            <div className="text-lg font-semibold truncate">{streamTitle || 'Live stream'}</div>
          )}
          {streamTitleTranslation && (
            <div className="text-lg font-semibold truncate">{streamTitleTranslation || 'Live stream'}</div>
          )}
          {streamTitleTranslation && (
            <div className="text-sm opacity-80 truncate">{streamTitle}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
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
