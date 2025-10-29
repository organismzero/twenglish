/**
 * LibreTranslate adapter (browser-side).
 * Users provide endpoint and optional API key via Settings.
 * Secrets are cached in sessionStorage and mirrored in the encrypted secure store.
 * Default endpoint: https://libretranslate.com
 */

import { getSecureSetting } from '../storage/secure'

const ENDPOINT_KEY = 'twen_libre_endpoint'
const API_KEY_KEY = 'twen_libre_key'

export function setLibreEndpoint(url) {
  if (typeof window === 'undefined') return
  if (url) {
    sessionStorage.setItem(ENDPOINT_KEY, url)
  } else {
    sessionStorage.removeItem(ENDPOINT_KEY)
  }
}
export function getLibreEndpoint() {
  if (typeof window === 'undefined') return 'https://libretranslate.com'
  const sessionValue = sessionStorage.getItem(ENDPOINT_KEY)
  if (sessionValue) return sessionValue
  const secureValue = getSecureSetting('libreEndpoint')
  if (secureValue) {
    sessionStorage.setItem(ENDPOINT_KEY, secureValue)
    return secureValue
  }
  return 'https://libretranslate.com'
}
export function setLibreApiKey(key) {
  if (typeof window === 'undefined') return
  if (key) {
    sessionStorage.setItem(API_KEY_KEY, key)
  } else {
    sessionStorage.removeItem(API_KEY_KEY)
  }
}
export function getLibreApiKey() {
  if (typeof window === 'undefined') return ''
  const sessionValue = sessionStorage.getItem(API_KEY_KEY)
  if (sessionValue) return sessionValue
  const secureValue = getSecureSetting('libreKey')
  if (secureValue) {
    sessionStorage.setItem(API_KEY_KEY, secureValue)
  }
  return secureValue || ''
}

/** 
 * Translate a single text using LibreTranslate.
 * @param {string} text
 * @param {string} sourceIso1 Detected language (e.g., 'es')
 * @param {string} targetIso1 Requested destination language (e.g., 'en')
 * @returns {Promise<string>} Translation (or original on failure)
 */
export async function translateToTarget(text, sourceIso1, targetIso1) {
  const endpoint = getLibreEndpoint()
  const key = getLibreApiKey()
  if (!endpoint) return text
  const target = targetIso1 || 'en'
  try {
    const res = await fetch(endpoint.replace(/\/$/, '') + '/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceIso1 || 'auto',
        target,
        format: 'text',
        api_key: key || undefined,
      }),
    })
    if (!res.ok) {
      console.warn('LibreTranslate error', await res.text())
      return text
    }
    const data = await res.json()
    // API returns { translatedText }
    return (data.translatedText || '').trim() || text
  } catch (e) {
    console.warn('LibreTranslate fetch failed', e)
    return text
  }
}
