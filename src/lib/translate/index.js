import { translateToEnglish } from './openai'

export async function translateIfNeeded(text, sourceIso1, primaryIso1) {
  if (!text) return text
  if (!primaryIso1 || primaryIso1 === 'en') return text
  if (sourceIso1 !== primaryIso1) return text
  return await translateToEnglish(text, sourceIso1)
}
