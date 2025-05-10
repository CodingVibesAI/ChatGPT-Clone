import ChatMessage from './chat-message'
import React, { useEffect, useRef } from 'react'

type ChatListProps = {
  messages: { id: string; role: 'user' | 'assistant'; content: string }[]
  searchTerm?: string
  searchResults?: number[]
  activeResultIdx?: number
  setScrollToBottomFn: (fn: () => void) => void
}

export default function ChatList({ messages, searchTerm, searchResults, activeResultIdx, setScrollToBottomFn }: ChatListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeIdx = searchResults && typeof activeResultIdx === 'number' && searchResults.length > 0 ? searchResults[activeResultIdx] : null
  const msgRefs = useRef<(HTMLDivElement | null)[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeIdx !== null && msgRefs.current[activeIdx]) {
      msgRefs.current[activeIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeIdx])

  // Auto-scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages.length])

  // Provide scrollToBottom function to parent
  useEffect(() => {
    setScrollToBottomFn(() => () => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [setScrollToBottomFn])

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto flex flex-col gap-4 relative">
      {messages.map((msg, idx) => (
        <React.Fragment key={msg.id}>
          <div
            ref={el => { msgRefs.current[idx] = el }}
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
      <div ref={endRef} />
    </div>
  )
} 