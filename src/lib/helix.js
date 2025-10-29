import { getToken, getClientId } from './auth'

const HELIX = 'https://api.twitch.tv/helix'

function headers() {
  const token = getToken()
  return {
    'Authorization': 'Bearer ' + token,
    'Client-Id': getClientId(),
  }
}

async function helix(path, query={}) {
  const url = new URL(HELIX + path)
  Object.entries(query).forEach(([k,v]) => {
    if (Array.isArray(v)) v.forEach(x => url.searchParams.append(k, x))
    else if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString(), { headers: headers() })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Helix ${path} failed: ${res.status} ${txt}`)
  }
  return await res.json()
}

export async function getUser() {
  const data = await helix('/users')
  return data.data?.[0] || null
}

export async function getUsersByLogin(logins=[]) {
  const data = await helix('/users', { login: logins })
  return data.data || []
}

export async function getFollowedStreams(user_id, first=50, after) {
  const data = await helix('/streams/followed', { user_id, first, after })
  return data
}

export async function getFollowedChannels(user_id, first=50, after) {
  const data = await helix('/channels/followed', { user_id, first, after })
  return data
}

export async function getStreamByUserId(user_id) {
  const data = await helix('/streams', { user_id })
  return data.data?.[0] || null
}

export async function getStreamTags(broadcaster_id) {
  // tags come with streams/channels; fallback via /streams?user_id
  const s = await getStreamByUserId(broadcaster_id)
  return s?.tags || []
}

export async function getGlobalEmotes(after) {
  const data = await helix('/chat/emotes/global', after ? { after } : {})
  return data
}

export async function getChannelEmotes(broadcasterId) {
  if (!broadcasterId) return []
  const data = await helix('/chat/emotes', { broadcaster_id: broadcasterId })
  return data.data || data.emotes || []
}

export async function getUserEmotes(userId) {
  if (!userId) return []
  const data = await helix('/chat/emotes/user', { user_id: userId })
  return data.data || data.emotes || []
}
