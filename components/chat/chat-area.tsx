"use client";
import ChatInput from './chat-input'
import { useRef, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import * as Tooltip from '@radix-ui/react-tooltip'
import React from 'react'

const DUMMY_MESSAGES: { id: number; role: 'user' | 'assistant'; content: string }[] = [
  { id: 1, role: 'user', content: 'How are you?' },
  { id: 2, role: 'assistant', content: 'Quite well, thank you!' },
]

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  if (role === 'assistant') {
    return (
      <div className="text-[#ececf1] px-6 py-4 max-w-full font-normal leading-relaxed whitespace-pre-line text-[15px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            ul: (props) => <ul className="list-disc pl-6" {...props} />,
            ol: (props) => <ol className="list-decimal pl-6" {...props} />,
            li: (props) => <li className="mb-1" {...props} />,
            strong: (props) => <strong className="font-semibold" {...props} />,
            code: (props) => <code className="bg-[#f7f7fa] px-1 py-0.5 rounded text-sm text-[#23272f]" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }
  return (
    <div className="bg-[#545563] text-white rounded-2xl rounded-br-3xl px-6 py-4 max-w-full font-normal leading-relaxed whitespace-pre-line text-[15px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
      {content}
    </div>
  )
}

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
              <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
                {DUMMY_MESSAGES.map((msg, idx) => (
                  <React.Fragment key={msg.id}>
                    <div
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <MessageBubble role={msg.role} content={msg.content} />
                    </div>
                    {idx < DUMMY_MESSAGES.length - 1 && (
                      <div className="w-full h-px bg-[#353740] my-2 opacity-50" />
                    )}
                  </React.Fragment>
                ))}
                <div ref={messagesEndRef} />
              </div>
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
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center w-full max-w-2xl gap-8">
              <h1 className="text-[2rem] md:text-[2.3rem] font-bold text-[#ececf1] text-center select-none tracking-tight drop-shadow-sm">
                What&apos;s on the agenda today?
              </h1>
              <div className="w-full flex justify-center mb-2">
                <div className="rounded-lg px-3 py-1.5 text-xs text-[#8e8ea0] font-medium select-none">
                  <span>GPT-4o</span>
                </div>
              </div>
              <div className="w-full">
                <ChatInput />
              </div>
            </div>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  )
} 