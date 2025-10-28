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

  return (
    <div className={`rounded-lg px-3 py-2 transition-colors ${rowClass}`}>
      <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 items-center">
        <span className="text-xs opacity-60 tabular-nums select-none leading-tight">{timestamp}</span>
        <div className="flex items-baseline gap-2">
          <div className="font-semibold truncate">{msg.user}</div>
          <div className="opacity-80">:</div>
          <div className="flex-1 leading-relaxed">
            {msg.translation ? (
              <div>
                <div>{msg.translation}</div>
                {showOriginal && <div className="text-xs opacity-60 mt-0.5">{msg.text}</div>}
              </div>
            ) : (
              <div>{msg.text}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
