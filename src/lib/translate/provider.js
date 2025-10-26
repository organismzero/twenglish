const PROVIDER_KEY = 'twen_translate_provider'

export function getProvider() {
  if (typeof window === 'undefined') return 'openai'
  return sessionStorage.getItem(PROVIDER_KEY) || 'openai'
}

export function setProvider(p) {
  if (!p) return
  sessionStorage.setItem(PROVIDER_KEY, p)
}

