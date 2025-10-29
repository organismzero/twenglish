function parseEmotePositions(emoteTag) {
  if (!emoteTag || typeof emoteTag !== 'string') return []
  const parts = emoteTag.split('/')
  const positions = []
  parts.forEach(part => {
    if (!part) return
    const [id, ranges] = part.split(':')
    if (!id || !ranges) return
    ranges.split(',').forEach(range => {
      const [startStr, endStr] = range.split('-')
      const start = Number.parseInt(startStr, 10)
      const end = Number.parseInt(endStr, 10)
      if (Number.isNaN(start) || Number.isNaN(end)) return
      positions.push({ id: id.trim(), start, end })
    })
  })
  return positions.sort((a, b) => a.start - b.start)
}

function findEmoteById(emoteMap, id) {
  if (!id) return null
  const target = id.toString()
  for (const code of Object.keys(emoteMap || {})) {
    const entry = emoteMap[code]
    if (!entry) continue
    const entryId = (entry.id || entry.code || '').toString()
    if (entryId === target) {
      return entry
    }
  }
  return null
}

function buildTwitchCdnEmote(id, code) {
  if (!id) return null
  const base = `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark`
  return {
    provider: 'twitch',
    id,
    code: code || id,
    name: code || id,
    images: {
      url_1x: `${base}/1.0`,
      url_2x: `${base}/2.0`,
      url_3x: `${base}/3.0`,
      url_4x: `${base}/4.0`,
    },
  }
}

function computeTextValue(tokens) {
  return tokens
    .filter(token => token.type === 'text')
    .map(token => token.value)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenizeWithPositions(message, emoteMap, positions) {
  const tokens = []
  let cursor = 0
  positions.forEach(({ id, start, end }) => {
    const safeStart = Math.max(0, Math.min(start, message.length))
    const safeEnd = Math.max(safeStart, Math.min(end, message.length - 1))
    if (safeStart > cursor) {
      tokens.push({ type: 'text', value: message.slice(cursor, safeStart) })
    }
    const code = message.slice(safeStart, safeEnd + 1)
    const fromMap = emoteMap[code] || findEmoteById(emoteMap, id)
    const emote = fromMap || buildTwitchCdnEmote(id, code)
    tokens.push({ type: 'emote', value: code, emote })
    cursor = safeEnd + 1
  })
  if (cursor < message.length) {
    tokens.push({ type: 'text', value: message.slice(cursor) })
  }
  return { textValue: computeTextValue(tokens), tokens }
}

export function tokenizeMessage(message, emoteMap = {}, options = {}) {
  if (!message) {
    return { textValue: '', tokens: [] }
  }
  const { emoteTag } = options || {}
  const positions = parseEmotePositions(emoteTag)
  if (positions.length) {
    return tokenizeWithPositions(message, emoteMap, positions)
  }
  const tokens = []
  let buffer = ''

  const flush = () => {
    if (!buffer) return
    tokens.push({ type: 'text', value: buffer })
    buffer = ''
  }

  const parts = message.split(/(\s+)/)
  parts.forEach(part => {
    if (!part) return
    const emote = emoteMap[part]
    if (emote) {
      flush()
      tokens.push({ type: 'emote', value: part, emote })
    } else {
      buffer += part
    }
  })
  flush()

  return { textValue: computeTextValue(tokens), tokens }
}

export function mergeTranslationTokens(tokens = [], translationText = '') {
  if (!translationText) return tokens
  const textEntries = []
  tokens.forEach((token, idx) => {
    if (
      token?.type === 'text' &&
      typeof token.value === 'string' &&
      token.value.trim().length > 0
    ) {
      textEntries.push({ idx, length: token.value.length })
    }
  })
  if (textEntries.length === 0) {
    const emoteTokens = tokens.filter(t => t?.type === 'emote')
    return [{ type: 'text', value: translationText }, ...emoteTokens]
  }
  const result = tokens.map(token => ({ ...token }))
  const totalOriginalLength = textEntries.reduce((sum, entry) => sum + entry.length, 0)
  let remainingOriginal = totalOriginalLength
  let remainingText = translationText

  textEntries.forEach((entry, position) => {
    const token = result[entry.idx]
    const isLast = position === textEntries.length - 1
    if (isLast) {
      token.value = remainingText
      remainingText = ''
      return
    }
    if (remainingOriginal <= 0 || !remainingText.length) {
      token.value = ''
      return
    }
    const sliceLength = Math.max(
      0,
      Math.round((entry.length / remainingOriginal) * remainingText.length)
    )
    const take = Math.min(sliceLength, remainingText.length)
    token.value = remainingText.slice(0, take)
    remainingText = remainingText.slice(take)
    remainingOriginal -= entry.length
  })

  if (remainingText) {
    result.push({ type: 'text', value: remainingText })
  }

  return result
}
