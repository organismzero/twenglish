"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { buildAuthUrl, getToken, validateToken, getClientId } from '../lib/auth'
import { withBasePath, getSiteOrigin } from '../lib/base-path'
import { getUser, getFollowedStreams, getFollowedChannels, getUsersByLogin } from '../lib/helix'
import ChannelCard from '../components/ChannelCard'
import SettingsDrawer from '../components/SettingsDrawer'
import Link from 'next/link'
import { TARGET_LANGUAGES } from '../lib/translate/target'

export default function HomePage() {
  const router = useRouter()
  const [tokenValid, setTokenValid] = useState(false)
  const [user, setUser] = useState(null)
  const [streams, setStreams] = useState([])
  const [channels, setChannels] = useState([])
  const [tab, setTab] = useState('live')
  const [loading, setLoading] = useState(false)
  const [languageFilter, setLanguageFilter] = useState('all')

  useEffect(() => {
    const token = getToken()
    if (!token) return
    validateToken(token).then(v => setTokenValid(!!v))
  }, [])

  useEffect(() => {
    if (!tokenValid) return
    setLoading(true)
    ;(async () => {
      const u = await getUser()
      setUser(u)
      // Live followed streams
      const fl = await getFollowedStreams(u.id, 100)
      const liveStreams = fl.data || []
      const liveLogins = liveStreams.map(s => s.user_login).filter(Boolean)
      const liveUsers = liveLogins.length ? await getUsersByLogin(liveLogins) : []
      const liveByLogin = Object.fromEntries(liveUsers.map(user => [user.login, user]))
      const liveNormalized = liveStreams.map(s => ({
        ...s,
        language: (s.language || '').toLowerCase(),
        profile_image_url: liveByLogin[s.user_login]?.profile_image_url || null,
      }))
      setStreams(liveNormalized)
      // All followed channels (first page)
      const ch = await getFollowedChannels(u.id, 100)
      // hydrate user_login for channels (broadcaster_id -> login)
      const logins = (ch.data || []).map(x => x.broadcaster_login).filter(Boolean)
      const users = await getUsersByLogin(logins)
      const byLogin = Object.fromEntries(users.map(u => [u.login, u]))
      const normalized = (ch.data || []).map(x => ({
        ...x,
        user_login: x.broadcaster_login,
        title: x.broadcaster_name,
        language: (x.broadcaster_language || '').toLowerCase(),
        viewer_count: 0,
        type: null,
        user_id: byLogin[x.broadcaster_login]?.id,
        profile_image_url: byLogin[x.broadcaster_login]?.profile_image_url || null,
      }))
      setChannels(normalized)
      setLoading(false)
    })()
  }, [tokenValid])

  const languageOptions = useMemo(() => {
    const codes = new Set()
    streams.forEach(s => {
      if (s.language) codes.add(s.language.toLowerCase())
    })
    channels.forEach(c => {
      if (c.language) codes.add(c.language.toLowerCase())
    })
    const mapped = Array.from(codes).sort().map(code => {
      const match = TARGET_LANGUAGES.find(l => l.iso1 === code)
      return { iso1: code, label: match ? match.label : code.toUpperCase() }
    })
    return [{ iso1: 'all', label: 'All languages' }, ...mapped]
  }, [streams, channels])

  const filteredStreams = useMemo(() => {
    if (languageFilter === 'all') return streams
    return streams.filter(s => (s.language || '') === languageFilter)
  }, [streams, languageFilter])

  const filteredChannels = useMemo(() => {
    if (languageFilter === 'all') return channels
    return channels.filter(s => (s.language || '') === languageFilter)
  }, [channels, languageFilter])

  const redirectUri = getSiteOrigin() + withBasePath('/callback/')

  function login() {
    const cid = getClientId()
    if (!cid) {
      alert('Please open Settings and enter your Twitch Client ID before connecting.')
      return
    }
    const url = buildAuthUrl({ redirectUri })
    window.location.href = url
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Twilingual</h1>
        <div className="ml-auto"><SettingsDrawer/></div>
      </div>

      {!tokenValid && (
        <div className="card">
          <p className="mb-3">Authenticate with Twitch to view your followed channels and join chat.</p>
          <button className="btn btn-primary" onClick={login}>Connect with Twitch</button>
        </div>
      )}

      {tokenValid && (
        <>
          <div className="card">
            <div className="flex flex-wrap items-center gap-4">
              <button className={`btn ${tab==='live'?'btn-primary':''}`} onClick={()=>setTab('live')}>Live</button>
              <button className={`btn ${tab==='all'?'btn-primary':''}`} onClick={()=>setTab('all')}>All Followed</button>
              <select
                className="input w-full sm:w-auto min-w-[12rem]"
                value={languageFilter}
                onChange={e => setLanguageFilter(e.target.value)}
              >
                {languageOptions.map(opt => (
                  <option key={opt.iso1} value={opt.iso1}>{opt.label}</option>
                ))}
              </select>
              <div className="ml-auto text-sm opacity-80">Logged in as <span className="font-semibold">{user?.display_name}</span></div>
            </div>
          </div>

          {loading && <div>Loading…</div>}

          {!loading && tab==='live' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredStreams.map(s => {
                const login = s.user_login
                return (
                  <ChannelCard
                    key={s.id + s.user_login}
                    stream={s}
                    href={{ pathname: '/chat/__placeholder__', query: { login } }}
                  />
                )
              })}
              {filteredStreams.length===0 && <div className="opacity-70">No live followed streams.</div>}
            </div>
          )}

          {!loading && tab==='all' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredChannels.map(s => {
                const login = s.user_login
                return (
                  <ChannelCard
                    key={s.user_id + s.user_login}
                    stream={s}
                    href={{ pathname: '/chat/__placeholder__', query: { login } }}
                  />
                )
              })}
              {filteredChannels.length===0 && <div className="opacity-70">No followed channels.</div>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
