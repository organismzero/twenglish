import { franc } from 'franc-min'

const ISO3_TO_1 = {
  'eng':'en','spa':'es','fra':'fr','deu':'de','por':'pt','ita':'it','jpn':'ja','kor':'ko',
  'rus':'ru','zho':'zh','pol':'pl','nld':'nl','tur':'tr','ara':'ar','hin':'hi','ind':'id',
  'ces':'cs','fin':'fi','swe':'sv','dan':'da','nor':'no','ukr':'uk','heb':'he','tha':'th',
  'vie':'vi','ell':'el','ron':'ro','hun':'hu','srp':'sr','hrv':'hr','bul':'bg','cat':'ca',
  'slk':'sk','slv':'sl','lit':'lt','lav':'lv','est':'et','tgl':'tl','msa':'ms'
}

export function iso3to1(code) {
  return ISO3_TO_1[code] || null
}

export function detectISO1(text) {
  const c = franc(text || '')
  if (c === 'und') return null
  return iso3to1(c)
}

export function majorityLanguageISO1(messages, minChars=10) {
  const counts = {}
  for (const m of messages) {
    const t = (m.text || '').trim()
    if (t.length < minChars) continue
    const iso1 = detectISO1(t)
    if (!iso1) continue
    counts[iso1] = (counts[iso1] || 0) + 1
  }
  let best = null, bestN = 0
  for (const [k,v] of Object.entries(counts)) {
    if (v > bestN) { best = k; bestN = v }
  }
  return best
}
