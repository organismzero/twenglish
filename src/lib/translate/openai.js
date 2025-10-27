/**
 * OpenAI translation adapter (browser-side).
 * SECURITY: Requires the user to provide their own OpenAI API key in Settings.
 * The key is stored in sessionStorage and used only from their browser.
 */

const OPENAI_KEY_KEY = 'twen_openai_key'
const OPENAI_MODEL_KEY = 'twen_openai_model'

export function setOpenAIKey(key) {
  if (key) sessionStorage.setItem(OPENAI_KEY_KEY, key)
}
export function getOpenAIKey() {
  return sessionStorage.getItem(OPENAI_KEY_KEY) || ''
}
export function setOpenAIModel(m) {
  if (m) sessionStorage.setItem(OPENAI_MODEL_KEY, m)
}
export function getOpenAIModel() {
  return sessionStorage.getItem(OPENAI_MODEL_KEY) || 'gpt-4o-mini'
}

/**
 * Translate a single text into the requested target language.
 * @param {string} text
 * @param {string} sourceIso1 Detected language (e.g., 'es')
 * @param {string} targetIso1 Requested destination language (e.g., 'en')
 * @returns {Promise<string>} Translation (or original on failure)
 */
export async function translateToTarget(text, sourceIso1, targetIso1) {
  const key = getOpenAIKey()
  if (!key) return text
  if (!targetIso1) return text

  const model = getOpenAIModel()
  const body = {
    model,
    messages: [
      {
        role: 'system',
        content: `You are a precise translator. Output only the translation into the language with ISO 639-1 code "${targetIso1}". No commentary.`,
      },
      {
        role: 'user',
        content: `Source language: ${sourceIso1 || 'unknown'}\nTarget language: ${targetIso1}\nText: ${text}`,
      }
    ],
    temperature: 0.2,
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      console.warn('OpenAI error', await res.text())
      return text
    }
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || text
  } catch (e) {
    console.warn('OpenAI fetch failed', e)
    return text
  }
}
