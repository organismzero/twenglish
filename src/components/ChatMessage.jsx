'use client'

export default function ChatMessage({ msg, showOriginal }) {
  return (
    <div className="py-1">
      <div className="flex gap-2">
        <div className="font-semibold">{msg.user}</div>
        <div className="opacity-80">:</div>
        <div className="flex-1">
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
  )
}
