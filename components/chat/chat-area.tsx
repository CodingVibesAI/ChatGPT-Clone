"use client";
import ChatInput from './chat-input'
import ChatPrompt from './chat-prompt'
import ChatList from './chat-list'
import { useRef, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import React from 'react'

const DUMMY_MESSAGES: { id: number; role: 'user' | 'assistant'; content: string }[] = [
  { id: 1, role: 'user', content: 'How are you?' },
  { id: 2, role: 'assistant', content: 'Quite well, thank you!' },
]

export default function ChatArea() {
  const hasMessages = DUMMY_MESSAGES.length > 0
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(true)

  useEffect(() => {
    if (atBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
    }
  }, [atBottom, hasMessages])

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 10)
  }

  return (
    <Tooltip.Provider>
      <div className="relative flex flex-col flex-1 h-full w-full bg-transparent font-sans tracking-normal font-normal">
        {hasMessages ? (
          <>
            <div
              className="flex-1 overflow-y-auto px-0 md:px-0 pt-10 pb-10"
              onScroll={handleScroll}
            >
              <ChatList messages={DUMMY_MESSAGES} />
              <div ref={messagesEndRef} />
            </div>
            {!atBottom && (
              <button
                className="fixed bottom-28 right-8 z-30 bg-[#343541] border border-[#444654] rounded-full p-2 hover:bg-[#444654] transition-colors"
                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                aria-label="Scroll to bottom"
              >
                <ChevronDown size={22} className="text-[#b4bcd0]" />
              </button>
            )}
            <div className="w-full flex justify-center bg-gradient-to-t from-[#131313] via-[#131313cc] to-transparent pb-6 pt-4 z-10">
              <div className="w-full max-w-2xl px-4">
                <ChatInput />
              </div>
            </div>
          </>
        ) : (
          <>
            <ChatPrompt modelName="GPT-4o" />
            <div className="w-full max-w-2xl px-4 mx-auto">
              <ChatInput />
            </div>
          </>
        )}
      </div>
    </Tooltip.Provider>
  )
} 