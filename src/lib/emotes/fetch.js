const BTTV_GLOBAL_URL = 'https://api.betterttv.net/3/cached/emotes/global'
const BTTV_USER_URL = 'https://api.betterttv.net/3/cached/users/twitch/'

const STV_GLOBAL_URL = 'https://7tv.io/v3/emote-sets/global'
const STV_USER_URL = 'https://7tv.io/v3/users/twitch/'

async function safeFetch(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Fetch failed ${res.status}: ${body}`)
  }
  return res.json()
}

import { getGlobalEmotes, getChannelEmotes, getUserEmotes } from '../helix'

export async function fetchTwitchGlobalEmotes() {
  const all = []
  let cursor
  do {
    const page = await getGlobalEmotes(cursor)
    if (!page) break
    const data = page.data || page.emotes || []
    if (Array.isArray(data)) all.push(...data)
    cursor = page.pagination?.cursor || undefined
  } while (cursor)
  return all
}

export async function fetchTwitchChannelEmotes(broadcasterId) {
  try {
    return await getChannelEmotes(broadcasterId)
  } catch (err) {
    console.warn('Twitch channel emotes fetch failed', err)
    return []
  }
}

export async function fetchTwitchUserEmotes() {
  try {
    return await getUserEmotes()
  } catch (err) {
    console.warn('Twitch user emotes fetch failed', err)
    return []
  }
}

export async function fetchBTTVGlobalEmotes() {
  try {
    const data = await safeFetch(BTTV_GLOBAL_URL)
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.warn('BTTV global emotes fetch failed', err)
    return []
  }
}

export async function fetchBTTVChannelEmotes(twitchId) {
  if (!twitchId) return []
  try {
    const data = await safeFetch(BTTV_USER_URL + twitchId)
    const channel = Array.isArray(data?.channelEmotes) ? data.channelEmotes : []
    const shared = Array.isArray(data?.sharedEmotes) ? data.sharedEmotes : []
    return [...channel, ...shared]
  } catch (err) {
    console.warn('BTTV channel emotes fetch failed', err)
    return []
  }
}

export async function fetchSevenTVGlobalEmotes() {
  try {
    const data = await safeFetch(STV_GLOBAL_URL)
    if (Array.isArray(data?.emotes)) return data.emotes
    if (Array.isArray(data?.emote_set?.emotes)) return data.emote_set.emotes
    return []
  } catch (err) {
    console.warn('7TV global emotes fetch failed', err)
    return []
  }
}

export async function fetchSevenTVChannelEmotes(twitchId) {
  if (!twitchId) return []
  try {
    const data = await safeFetch(STV_USER_URL + twitchId)
    const emoteSet = data?.emote_set?.emotes
    if (Array.isArray(emoteSet)) return emoteSet
    if (Array.isArray(data?.emotes)) return data.emotes
    return []
  } catch (err) {
    console.warn('7TV channel emotes fetch failed', err)
    return []
  }
}
