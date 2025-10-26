'use client'

import { useEffect, useState } from 'react'
import { buildAuthUrl, getToken, validateToken, getClientId } from '../lib/auth'
import { getUser, getFollowedStreams, getFollowedChannels, getUsersByLogin } from '../lib/helix'
import ChannelCard from '../components/ChannelCard'
import SettingsDrawer from '../components/SettingsDrawer'
import Link from 'next/link'

export default function HomePage() {
  const [tokenValid, setTokenValid] = useState(false)
  const [user, setUser] = useState(null)
  const [streams, setStreams] = useState([])
  const [channels, setChannels] = useState([])
  const [tab, setTab] = useState('live')
  const [loading, setLoading] = useState(false)

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
      setStreams(fl.data || [])
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
        language: x.broadcaster_language,
        viewer_count: 0,
        type: null,
        user_id: byLogin[x.broadcaster_login]?.id
      }))
      setChannels(normalized)
      setLoading(false)
    })()
  }, [tokenValid])

  const redirectUri = (typeof window !== 'undefined')
    ? window.location.origin + (process.env.NODE_ENV === 'production' ? '/twenglish' : '') + '/callback/'
    : ''

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
        <h1 className="text-2xl font-semibold">Twenglish</h1>
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
            <div className="flex items-center gap-4">
              <button className={`btn ${tab==='live'?'btn-primary':''}`} onClick={()=>setTab('live')}>Live</button>
              <button className={`btn ${tab==='all'?'btn-primary':''}`} onClick={()=>setTab('all')}>All Followed</button>
              <div className="ml-auto text-sm opacity-80">Logged in as <span className="font-semibold">{user?.display_name}</span></div>
            </div>
          </div>

          {loading && <div>Loading…</div>}

          {!loading && tab==='live' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {streams.map(s => (
                <ChannelCard key={s.id + s.user_login} stream={s} onJoin={(login)=>{ window.location.href = `/chat/${login}/` }} />
              ))}
              {streams.length===0 && <div className="opacity-70">No live followed streams.</div>}
            </div>
          )}

          {!loading && tab==='all' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {channels.map(s => (
                <ChannelCard key={s.user_id + s.user_login} stream={s} onJoin={(login)=>{ window.location.href = `/chat/${login}/` }} />
              ))}
              {channels.length===0 && <div className="opacity-70">No followed channels.</div>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
