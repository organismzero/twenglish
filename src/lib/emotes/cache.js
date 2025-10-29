import { STORAGE_KEYS, EMOTE_TTL_MS } from './constants'

function readKey(key) {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(key)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const ts = parsed?.generatedAt ? new Date(parsed.generatedAt).getTime() : 0
    if (!ts || Date.now() - ts > EMOTE_TTL_MS) {
      window.localStorage.removeItem(key)
      return null
    }
    return { emotes: parsed?.emotes || [], generatedAt: ts }
  } catch {
    window.localStorage.removeItem(key)
    return null
  }
}

function writeKey(key, emotes) {
  if (typeof window === 'undefined' || !emotes) return
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        emotes,
      })
    )
  } catch (err) {
    console.warn('Failed to cache emotes for key', key, err)
  }
}

export function getCachedEmotes(provider, channelId) {
  const entry = getEmoteEntry(provider, channelId)
  return entry?.emotes || []
}

export function getEmoteEntry(provider, channelId) {
  const key = resolveKey(provider, channelId)
  if (!key) return null
  return readKey(key)
}

export function setCachedEmotes(provider, emotes, channelId) {
  const key = resolveKey(provider, channelId)
  if (!key) return
  writeKey(key, emotes)
}

export function needsRefresh(provider, channelId) {
  return !getEmoteEntry(provider, channelId)
}

function resolveKey(provider, channelId) {
  switch (provider) {
    case 'twitch':
      return STORAGE_KEYS.TWITCH_GLOBAL
    case 'twitch-channel':
      return channelId ? STORAGE_KEYS.TWITCH_CHANNEL_PREFIX + channelId : null
    case 'twitch-user':
      return channelId ? STORAGE_KEYS.TWITCH_USER_PREFIX + channelId : null
    case 'bttv-global':
      return STORAGE_KEYS.BTTV_GLOBAL
    case 'bttv-channel':
      return channelId ? STORAGE_KEYS.BTTV_CHANNEL_PREFIX + channelId : null
    case '7tv-global':
      return STORAGE_KEYS.SEVENTV_GLOBAL
    case '7tv-channel':
      return channelId ? STORAGE_KEYS.SEVENTV_CHANNEL_PREFIX + channelId : null
    default:
      return null
  }
}
