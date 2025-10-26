/**
 * LibreTranslate adapter (browser-side).
 * Users provide endpoint and optional API key via Settings.
 * Default endpoint: https://libretranslate.com
 */

const ENDPOINT_KEY = 'twen_libre_endpoint'
const API_KEY_KEY = 'twen_libre_key'

export function setLibreEndpoint(url) {
  if (url) sessionStorage.setItem(ENDPOINT_KEY, url)
}
export function getLibreEndpoint() {
  return sessionStorage.getItem(ENDPOINT_KEY) || 'https://libretranslate.com'
}
export function setLibreApiKey(key) {
  if (key) sessionStorage.setItem(API_KEY_KEY, key)
}
export function getLibreApiKey() {
  return sessionStorage.getItem(API_KEY_KEY) || ''
}

/**
 * Translate a single text to English using LibreTranslate.
 * @param {string} text
 * @param {string} sourceIso1 Detected language (e.g., 'es')
 * @returns {Promise<string>} English translation (or original on failure)
 */
export async function translateToEnglish(text, sourceIso1) {
  const endpoint = getLibreEndpoint()
  const key = getLibreApiKey()
  if (!endpoint) return text
  try {
    const res = await fetch(endpoint.replace(/\/$/, '') + '/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceIso1 || 'auto',
        target: 'en',
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

