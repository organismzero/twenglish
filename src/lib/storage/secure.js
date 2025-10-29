/**
 * Secure settings persistence backed by AES-GCM with PBKDF2 key derivation.
 * Secrets are encrypted into localStorage so they can survive browser restarts,
 * while the decrypted payload and passphrase remain in-memory for the session.
 */

const SECURE_STORAGE_KEY = 'twilingual_secure_settings_v1'

let cachedSettings = null
let cachedPassphrase = null

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function getCrypto() {
  if (!isBrowser()) return null
  return window.crypto && window.crypto.subtle ? window.crypto : null
}

function encodeBase64(arrayBuffer) {
  const bytes = arrayBuffer instanceof ArrayBuffer ? new Uint8Array(arrayBuffer) : arrayBuffer
  if (typeof window === 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function decodeBase64(value) {
  if (typeof value !== 'string' || !value.length) return new Uint8Array()
  if (typeof window === 'undefined') {
    return Uint8Array.from(Buffer.from(value, 'base64'))
  }
  const binary = window.atob(value)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function deriveKey(passphrase, salt) {
  const crypto = getCrypto()
  if (!crypto) throw new Error('Secure storage unavailable: missing Web Crypto API.')
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 150000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encryptString(plainText, passphrase) {
  const crypto = getCrypto()
  if (!crypto) throw new Error('Secure storage unavailable: missing Web Crypto API.')
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  const encoded = new TextEncoder().encode(plainText)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return {
    salt: encodeBase64(salt),
    iv: encodeBase64(iv),
    data: encodeBase64(encrypted),
  }
}

async function decryptToString(record, passphrase) {
  const crypto = getCrypto()
  if (!crypto) throw new Error('Secure storage unavailable: missing Web Crypto API.')
  if (!record || typeof record !== 'object') return ''
  const salt = decodeBase64(record.salt || '')
  const iv = decodeBase64(record.iv || '')
  const data = decodeBase64(record.data || '')
  if (!salt.length || !iv.length || !data.length) return ''
  const key = await deriveKey(passphrase, salt)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return new TextDecoder().decode(decrypted)
}

function readStoredRecord() {
  if (!isBrowser()) return null
  const raw = window.localStorage.getItem(SECURE_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Failed to parse secure settings payload, clearing.', err)
    window.localStorage.removeItem(SECURE_STORAGE_KEY)
    return null
  }
}

function writeStoredRecord(record) {
  if (!isBrowser()) return
  window.localStorage.setItem(SECURE_STORAGE_KEY, JSON.stringify(record))
}

/**
 * Determine whether encrypted settings are present in localStorage.
 * @returns {boolean}
 */
export function hasSecureSettings() {
  if (!isBrowser()) return false
  return Boolean(window.localStorage.getItem(SECURE_STORAGE_KEY))
}

/**
 * Determine whether the secure settings store is unlocked for this session.
 * @returns {boolean}
 */
export function isSecureStoreUnlocked() {
  return Boolean(cachedPassphrase)
}

/**
 * Unlock and decrypt the secure settings store using the provided passphrase.
 * @param {string} passphrase User-supplied passphrase for decryption.
 * @returns {Promise<boolean>} True when unlocked, false on failure.
 */
export async function unlockSecureSettings(passphrase) {
  if (!isBrowser()) return false
  if (!passphrase) return false
  const record = readStoredRecord()
  if (!record) {
    cachedPassphrase = passphrase
    cachedSettings = {}
    return true
  }
  try {
    const decrypted = await decryptToString(record, passphrase)
    const parsed = decrypted ? JSON.parse(decrypted) : {}
    cachedPassphrase = passphrase
    cachedSettings = parsed && typeof parsed === 'object' ? parsed : {}
    return true
  } catch (err) {
    console.warn('Failed to unlock secure settings', err)
    cachedPassphrase = null
    cachedSettings = null
    return false
  }
}

/**
 * Persist secure settings updates using the active session passphrase.
 * @param {Record<string, string>} updates Key/value pairs to store.
 */
export async function saveSecureSettings(updates = {}) {
  if (!isBrowser()) return
  if (!cachedPassphrase) throw new Error('Secure settings are locked.')
  const next = { ...(cachedSettings || {}) }
  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      delete next[key]
    } else {
      next[key] = value
    }
  })
  cachedSettings = next
  const encrypted = await encryptString(JSON.stringify(next), cachedPassphrase)
  writeStoredRecord(encrypted)
}

/**
 * Retrieve a single decrypted secure setting by key.
 * @param {string} key Setting identifier.
 * @returns {string}
 */
export function getSecureSetting(key) {
  if (!cachedSettings || typeof cachedSettings !== 'object') return ''
  const value = cachedSettings[key]
  return typeof value === 'string' ? value : ''
}

/**
 * Retrieve a shallow copy of all decrypted secure settings.
 * @returns {Record<string, string>}
 */
export function getAllSecureSettings() {
  if (!cachedSettings || typeof cachedSettings !== 'object') return {}
  return { ...cachedSettings }
}

/**
 * Remove all encrypted secrets from storage and reset the cache.
 */
export function resetSecureSettings() {
  if (isBrowser()) {
    window.localStorage.removeItem(SECURE_STORAGE_KEY)
  }
  cachedSettings = null
  cachedPassphrase = null
}

/**
 * Lock the secure settings store for this session.
 */
export function lockSecureSettings() {
  cachedPassphrase = null
  cachedSettings = null
}

