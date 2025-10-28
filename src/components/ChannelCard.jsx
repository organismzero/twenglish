'use client'

import Link from 'next/link'

export default function ChannelCard({ stream, onJoin, href }) {
  const login = stream.user_login || stream.broadcaster_login
  const title = stream.title || ''
  const lang = stream.language || 'unknown'
  const viewer_count = stream.viewer_count
  const isLive = !!stream.type || stream.is_live
  const avatar = stream.profile_image_url || ''
  const fallbackInitial = (login || '?')[0]

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={`${login} avatar`}
            className="w-10 h-10 rounded-xl object-cover border border-aquadark-700"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-aquadark-800 grid place-items-center uppercase font-bold">{fallbackInitial}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold">{login}</div>
          <div className="text-sm opacity-80 whitespace-normal break-words">{title}</div>
        </div>
        <div className="badge">{lang.toUpperCase()}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs opacity-70">{isLive ? `Live • ${viewer_count||0} viewers` : 'Offline'}</div>
        {href ? (
          <Link className="btn btn-primary" href={href} prefetch={false}>Join chat</Link>
        ) : (
          <button className="btn btn-primary" onClick={()=>onJoin(login)}>Join chat</button>
        )}
      </div>
    </div>
  )
}
