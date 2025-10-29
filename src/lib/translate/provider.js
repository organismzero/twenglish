const PROVIDER_KEY = 'twen_translate_provider'

function getStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getProvider() {
  const storage = getStorage()
  if (!storage) return 'openai'
  return storage.getItem(PROVIDER_KEY) || 'openai'
}

export function setProvider(p) {
  if (!p) return
  const storage = getStorage()
  if (!storage) return
  storage.setItem(PROVIDER_KEY, p)
}
