import { getProvider } from './provider'
import { translateToEnglish as openaiTranslate } from './openai'
import { translateToEnglish as libreTranslate } from './libre'

export async function translateIfNeeded(text, sourceIso1, primaryIso1) {
  if (!text) return text
  if (!primaryIso1 || primaryIso1 === 'en') return text
  if (sourceIso1 !== primaryIso1) return text
  const provider = getProvider()
  if (provider === 'libre') {
    return await libreTranslate(text, sourceIso1)
  }
  return await openaiTranslate(text, sourceIso1)
}
