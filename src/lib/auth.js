/**
 * Twitch OAuth (Implicit Grant) helpers for browser-only SPA.
 * Stores token in sessionStorage under 'twen_token'.
 */

import { getSecureSetting } from './storage/secure'

const TWITCH_AUTH_BASE = 'https://id.twitch.tv/oauth2/authorize'
const TWITCH_VALIDATE = 'https://id.twitch.tv/oauth2/validate'

export function getClientId() {
  // Client ID is provided via runtime config UI (settings) and stored in sessionStorage.
  if (typeof window === 'undefined') return ''
  const sessionValue = sessionStorage.getItem('twen_twitch_client_id')
  if (sessionValue) return sessionValue
  const secureValue = getSecureSetting('twitchClientId')
  if (secureValue) {
    sessionStorage.setItem('twen_twitch_client_id', secureValue)
    return secureValue
  }
  return ''
}

export function setClientId(id) {
  if (typeof window === 'undefined') return
  if (id) {
    sessionStorage.setItem('twen_twitch_client_id', id)
  } else {
    sessionStorage.removeItem('twen_twitch_client_id')
  }
}

export function getToken() {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('twen_token') || ''
}

export function setToken(token) {
  if (typeof window === 'undefined') return
  if (token) sessionStorage.setItem('twen_token', token)
}

export function clearToken() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('twen_token')
}

function generateSecureState() {
  if (typeof window === 'undefined') return ''
  const crypto = window.crypto && window.crypto.getRandomValues ? window.crypto : null
  if (!crypto) {
    console.warn('Secure random generator unavailable; falling back to less secure state token.')
    return Math.random().toString(36).slice(2)
  }
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function buildAuthUrl({ redirectUri, scopes=['chat:read','user:read:follows','user:read:emotes'] }) {
  if (typeof window === 'undefined') return ''
  const client_id = getClientId()
  const state = generateSecureState()
  sessionStorage.setItem('twen_oauth_state', state)
  const url = new URL(TWITCH_AUTH_BASE)
  url.searchParams.set('client_id', client_id)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'token')
  url.searchParams.set('scope', scopes.join(' '))
  url.searchParams.set('state', state)
  return url.toString()
}

export async function validateToken(token) {
  const res = await fetch(TWITCH_VALIDATE, { headers: { 'Authorization': 'OAuth ' + token }})
  if (!res.ok) return null
  return await res.json()
}

export function parseFragmentAndStoreToken() {
  if (typeof window === 'undefined') return null
  if (!window.location.hash) return null
  const params = new URLSearchParams(window.location.hash.slice(1))
  const token = params.get('access_token')
  const state = params.get('state')
  const stored = sessionStorage.getItem('twen_oauth_state')
  if (token && state && stored && state === stored) {
    setToken(token)
    // clean up URL
    history.replaceState({}, document.title, window.location.pathname)
    return token
  }
  return null
}
