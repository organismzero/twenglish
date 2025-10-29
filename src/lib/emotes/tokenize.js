export function tokenizeMessage(message, emoteMap = {}) {
  if (!message) {
    return { textValue: '', tokens: [] }
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

  const textValue = tokens
    .filter(token => token.type === 'text')
    .map(token => token.value)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()

  return { textValue, tokens }
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
