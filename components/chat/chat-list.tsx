import ChatMessage from './chat-message'
import React, { useEffect, useRef } from 'react'

export default function ChatList({ messages, searchTerm, searchResults, activeResultIdx }: {
  messages: { id: string; role: 'user' | 'assistant'; content: string }[]
  searchTerm?: string
  searchResults?: number[]
  activeResultIdx?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeIdx = searchResults && typeof activeResultIdx === 'number' && searchResults.length > 0 ? searchResults[activeResultIdx] : null
  const msgRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (activeIdx !== null && msgRefs.current[activeIdx]) {
      msgRefs.current[activeIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeIdx])

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {messages.map((msg, idx) => (
        <React.Fragment key={msg.id}>
          <div
            ref={el => msgRefs.current[idx] = el}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <ChatMessage
              role={msg.role}
              content={msg.content}
              highlight={!!searchTerm && activeIdx === idx}
              searchTerm={searchTerm}
            />
          </div>
          {idx < messages.length - 1 && (
            <div className="w-full h-px bg-[#353740] my-2 opacity-50" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
} 