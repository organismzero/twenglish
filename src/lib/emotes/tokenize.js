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
  const textTokenIndices = []
  let totalOriginalLength = 0
  tokens.forEach((token, idx) => {
    if (token?.type === 'text') {
      textTokenIndices.push(idx)
      totalOriginalLength += token.value?.length || 0
    }
  })
  if (textTokenIndices.length === 0) {
    return [{ type: 'text', value: translationText }, ...tokens.filter(t => t?.type === 'emote')]
  }
  let remainingText = translationText
  let remainingOriginal = totalOriginalLength
  const result = tokens.map(token => ({ ...token }))
  textTokenIndices.forEach((index, position) => {
    const token = result[index]
    const originalLength = token.value?.length || 0
    const isLast = position === textTokenIndices.length - 1
    if (isLast) {
      token.value = remainingText
      remainingText = ''
      return
    }
    if (remainingOriginal <= 0 || !remainingText.length) {
      token.value = ''
      return
    }
    const remainingLength = remainingText.length
    const sliceLength = Math.max(0, Math.round((originalLength / remainingOriginal) * remainingLength))
    const take = Math.min(sliceLength, remainingText.length)
    token.value = remainingText.slice(0, take)
    remainingText = remainingText.slice(take)
    remainingOriginal -= originalLength
  })
  if (remainingText) {
    result.push({ type: 'text', value: remainingText })
  }
  return result
}

