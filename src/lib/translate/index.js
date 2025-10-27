import { getProvider } from './provider'
import { getTargetLanguage } from './target'
import { translateToTarget as openaiTranslate } from './openai'
import { translateToTarget as libreTranslate } from './libre'

export async function translateIfNeeded(text, sourceIso1, primaryIso1) {
  if (!text) return text

  const targetIso1 = (getTargetLanguage() || 'en').toLowerCase()
  const primary = (primaryIso1 || '').toLowerCase()
  const source = (sourceIso1 || '').toLowerCase()

  if (!primary || primary === targetIso1) return text
  if (!source || source !== primary) return text

  const provider = getProvider()
  if (provider === 'libre') {
    return await libreTranslate(text, source, targetIso1)
  }
  return await openaiTranslate(text, source, targetIso1)
}
