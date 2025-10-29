'use client'

function formatTimestamp(ts) {
  if (!ts) return '--:--'
  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    return formatter.format(new Date(ts))
  } catch {
    return '--:--'
  }
}

export default function ChatMessage({ msg, showOriginal, index = 0 }) {
  const timestamp = formatTimestamp(msg?.ts)
  const rowClass = index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'
  const tokens = Array.isArray(msg?.tokens) && msg.tokens.length ? msg.tokens : [{ type: 'text', value: msg?.text || '' }]
  const translationTokens = Array.isArray(msg?.translationTokens) && msg.translationTokens.length ? msg.translationTokens : tokens
  const hasTranslation = Boolean(msg?.translationText && msg.translationText.trim().length > 0)

  const renderTokens = (list, keyPrefix) => (
    list.map((token, idx) => {
      if (!token) return null
      if (token.type === 'emote') {
        const images = token.emote?.images || {}
        const url = images.url_2x || images.url_3x || images.url_1x || images.url_4x || ''
        if (!url) return <span key={`${keyPrefix}-text-${idx}`}>{token.value}</span>
        return (
          <img
            key={`${keyPrefix}-emote-${idx}`}
            src={url}
            alt={token.value}
            title={token.emote?.name || token.value}
            className="inline h-5 w-auto align-middle"
            loading="lazy"
          />
        )
      }
      if (token.value === undefined || token.value === null) return null
      if (token.value === '') return <span key={`${keyPrefix}-text-${idx}`}>&nbsp;</span>
      return <span key={`${keyPrefix}-text-${idx}`}>{token.value}</span>
    })
  )

  return (
    <div className={`rounded-lg px-3 py-2 transition-colors ${rowClass}`}>
      <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 items-center">
        <span className="text-xs opacity-60 tabular-nums select-none leading-tight">{timestamp}</span>
        <div className="flex items-baseline gap-2">
          <div className="font-semibold truncate">{msg.user}</div>
          <div className="opacity-80">:</div>
          <div className="flex-1 leading-relaxed">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
              {renderTokens(translationTokens, hasTranslation ? 'translation' : 'message')}
            </div>
            {showOriginal && hasTranslation && (
              <div className="text-xs opacity-60 mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5">
                {renderTokens(tokens, 'original')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
