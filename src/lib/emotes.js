/**
 * Emote cache utilities.
 * Emotes are cached in localStorage by the home page bootstrap.
 */

const STORAGE_KEY = 'twilingual_global_emotes'

export function getCachedEmotes() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.emotes)) return []
    return parsed.emotes
  } catch {
    return []
  }
}

export function mapEmotesByCode(emotes = []) {
  return emotes.reduce((acc, emote) => {
    if (!emote?.name) return acc
    const key = emote.name
    acc[key] = emote
    return acc
  }, {})
}

/**
 * Parse a chat message into tokens of text and emotes.
 * @param {string} message
 * @param {Record<string, object>} emoteMap keyed by emote code
 * @returns {{textSegments: string[], tokens: Array<{type:'text'|'emote', value:string, emote?:object}>}}
 */
export function tokenizeMessage(message, emoteMap) {
  if (!message) {
    return { textValue: '', tokens: [] }
  }
  const tokens = []
  let buffer = ''

  const flushBuffer = () => {
    if (!buffer) return
    tokens.push({ type: 'text', value: buffer })
    buffer = ''
  }

  for (const chunk of message.split(/(\s+)/)) {
    if (!chunk) continue
    const emote = emoteMap[chunk]
    if (emote) {
      flushBuffer()
      tokens.push({ type: 'emote', value: chunk, emote })
    } else {
      buffer += chunk
    }
  }
  flushBuffer()

  const textValue = tokens
    .filter(token => token.type === 'text')
    .map(token => token.value)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()

  return { textValue, tokens }
}
