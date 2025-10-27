/**
 * Target language selection utilities.
 * All state is persisted in sessionStorage to stay browser-scoped.
 */

/**
 * List of supported target languages (ISO 639-1 codes).
 * @type {{ label: string, iso1: string }[]}
 */
export const TARGET_LANGUAGES = [
  { label: 'English', iso1: 'en' },
  { label: 'Albanian', iso1: 'sq' },
  { label: 'Amharic', iso1: 'am' },
  { label: 'Arabic', iso1: 'ar' },
  { label: 'Armenian', iso1: 'hy' },
  { label: 'Bengali', iso1: 'bn' },
  { label: 'Bosnian', iso1: 'bs' },
  { label: 'Bulgarian', iso1: 'bg' },
  { label: 'Burmese', iso1: 'my' },
  { label: 'Catalan', iso1: 'ca' },
  { label: 'Chinese', iso1: 'zh' },
  { label: 'Croatian', iso1: 'hr' },
  { label: 'Czech', iso1: 'cs' },
  { label: 'Danish', iso1: 'da' },
  { label: 'Dutch', iso1: 'nl' },
  { label: 'Estonian', iso1: 'et' },
  { label: 'Finnish', iso1: 'fi' },
  { label: 'French', iso1: 'fr' },
  { label: 'Georgian', iso1: 'ka' },
  { label: 'German', iso1: 'de' },
  { label: 'Greek', iso1: 'el' },
  { label: 'Gujarati', iso1: 'gu' },
  { label: 'Hindi', iso1: 'hi' },
  { label: 'Hungarian', iso1: 'hu' },
  { label: 'Icelandic', iso1: 'is' },
  { label: 'Indonesian', iso1: 'id' },
  { label: 'Italian', iso1: 'it' },
  { label: 'Japanese', iso1: 'ja' },
  { label: 'Kannada', iso1: 'kn' },
  { label: 'Kazakh', iso1: 'kk' },
  { label: 'Korean', iso1: 'ko' },
  { label: 'Latvian', iso1: 'lv' },
  { label: 'Lithuanian', iso1: 'lt' },
  { label: 'Macedonian', iso1: 'mk' },
  { label: 'Malay', iso1: 'ms' },
  { label: 'Malayalam', iso1: 'ml' },
  { label: 'Marathi', iso1: 'mr' },
  { label: 'Mongolian', iso1: 'mn' },
  { label: 'Norwegian', iso1: 'no' },
  { label: 'Persian', iso1: 'fa' },
  { label: 'Polish', iso1: 'pl' },
  { label: 'Portuguese', iso1: 'pt' },
  { label: 'Punjabi', iso1: 'pa' },
  { label: 'Romanian', iso1: 'ro' },
  { label: 'Russian', iso1: 'ru' },
  { label: 'Serbian', iso1: 'sr' },
  { label: 'Slovak', iso1: 'sk' },
  { label: 'Slovenian', iso1: 'sl' },
  { label: 'Somali', iso1: 'so' },
  { label: 'Spanish', iso1: 'es' },
  { label: 'Swahili', iso1: 'sw' },
  { label: 'Swedish', iso1: 'sv' },
  { label: 'Tagalog', iso1: 'tl' },
  { label: 'Tamil', iso1: 'ta' },
  { label: 'Telugu', iso1: 'te' },
  { label: 'Thai', iso1: 'th' },
  { label: 'Turkish', iso1: 'tr' },
  { label: 'Ukrainian', iso1: 'uk' },
  { label: 'Urdu', iso1: 'ur' },
  { label: 'Vietnamese', iso1: 'vi' }
]

const TARGET_LANGUAGE_KEY = 'twen_translate_target'

/**
 * Persist a supported target language, defaulting to English when unknown.
 * @param {string} iso1 Two-letter ISO 639-1 code requested by the user.
 */
export function setTargetLanguage(iso1) {
  if (!iso1 || typeof window === 'undefined') return
  const supported = TARGET_LANGUAGES.some(lang => lang.iso1 === iso1)
  sessionStorage.setItem(TARGET_LANGUAGE_KEY, supported ? iso1 : 'en')
}

/**
 * Retrieve the stored target language ISO code, or English as a fallback.
 * @returns {string}
 */
export function getTargetLanguage() {
  if (typeof window === 'undefined') return 'en'
  const stored = sessionStorage.getItem(TARGET_LANGUAGE_KEY)
  return stored && TARGET_LANGUAGES.some(lang => lang.iso1 === stored) ? stored : 'en'
}

