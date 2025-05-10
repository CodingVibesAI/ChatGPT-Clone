"use client";
import ChatInput from './chat-input'
import ChatPrompt from './chat-prompt'
import { useEffect, useState, useRef } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import React from 'react'
import { useActiveConversation } from '@/hooks/use-active-conversation'
import { useMessages } from '@/hooks/use-messages'
import ChatList from './chat-list'
import { ChevronDown } from 'lucide-react'

export default function ChatArea() {
  const { activeConversationId } = useActiveConversation()
  const { data: messages } = useMessages(activeConversationId)

  // Chat search state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [activeResultIdx, setActiveResultIdx] = useState(0)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Update search results when term or messages change
  useEffect(() => {
    if (!searchTerm || !messages) {
      setSearchResults([])
      setActiveResultIdx(0)
      return
    }
    const lower = searchTerm.toLowerCase()
    const matches = messages
      .map((msg, i) => msg.content.toLowerCase().includes(lower) ? i : -1)
      .filter(i => i !== -1)
    setSearchResults(matches)
    setActiveResultIdx(0)
  }, [searchTerm, messages])

  // Handler to jump to next/prev result
  const jumpToResult = (dir: 1 | -1) => {
    if (!searchResults.length) return
    setActiveResultIdx(idx => (idx + dir + searchResults.length) % searchResults.length)
  }

  // Handler to close search
  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchTerm('')
    setSearchResults([])
    setActiveResultIdx(0)
  }

  // Track scroll position to show/hide scroll-to-bottom button
  useEffect(() => {
    if (!messages) return
    const container = scrollContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      setIsAtBottom(atBottom)
    }
    container.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [messages?.length])

  // Provide scrollToBottomFn for the button
  useEffect(() => {
    setScrollToBottomFn(() => () => {
      scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  const [scrollToBottomFn, setScrollToBottomFn] = useState<(() => void) | null>(null)

  return (
    <Tooltip.Provider>
      <div className="relative flex flex-col flex-1 h-full w-full min-h-0 bg-transparent font-sans tracking-normal font-normal">
        {activeConversationId && messages && messages.length > 0 ? (
          <>
            <div
              ref={scrollContainerRef}
              className="flex-1 min-h-0 overflow-y-auto px-0 md:px-0 pt-10 pb-10 scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {messages && (
                <ChatList
                  messages={messages.map(m => ({
                    id: m.id,
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                  }))}
                  searchTerm={searchTerm}
                  searchResults={searchResults}
                  activeResultIdx={activeResultIdx}
                  setScrollToBottomFn={setScrollToBottomFn}
                />
              )}
            </div>
            {messages && !isAtBottom && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[120px] z-[9999] pointer-events-none w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => scrollToBottomFn && scrollToBottomFn()}
                  className="bg-[#23272f] border border-[#353740] shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-white hover:bg-[#353740] transition pointer-events-auto"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDown className="w-7 h-7" />
                </button>
              </div>
            )}
            <div className="w-full max-w-2xl px-4 mx-auto pb-6">
              <ChatInput
                onOpenSearch={() => setIsSearchOpen(true)}
              />
            </div>
            {/* Search Modal */}
            {isSearchOpen && (
              <div className="absolute left-1/2 bottom-[88px] z-50 w-full max-w-2xl px-4 transform -translate-x-1/2">
                <div className="bg-[#23272f] border border-[#353740] rounded-lg shadow-2xl p-6 w-full relative">
                  <button
                    className="absolute top-2 right-2 text-[#ececf1] hover:text-red-500"
                    onClick={closeSearch}
                    aria-label="Close search"
                  >
                    ×
                  </button>
                  <input
                    autoFocus
                    className="w-full bg-[#353740] border border-[#23272f] rounded-md px-3 py-2 text-[#ececf1] placeholder-[#b4bcd0] outline-none focus:border-[#ececf1] focus:ring-2 focus:ring-[#ececf1] transition mb-4"
                    placeholder="Search in chat..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchResults.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {searchResults.map((idx, i) => (
                        <button
                          key={idx}
                          className={`text-left px-2 py-1 rounded ${i === activeResultIdx ? 'bg-[#40414f] text-[#ececf1]' : 'text-[#b4bcd0]'}`}
                          onClick={() => setActiveResultIdx(i)}
                        >
                          <span className="font-semibold">{messages[idx].content.slice(0, 80)}</span>
                        </button>
                      ))}
                    </div>
                  ) : searchTerm ? (
                    <div className="text-[#b4bcd0] text-sm">No results</div>
                  ) : null}
                  {searchResults.length > 0 && (
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-[#b4bcd0]">
                        {activeResultIdx + 1} of {searchResults.length}
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 rounded bg-[#353740] text-[#ececf1] hover:bg-[#40414f]"
                          onClick={() => jumpToResult(-1)}
                        >Prev</button>
                        <button
                          className="px-2 py-1 rounded bg-[#353740] text-[#ececf1] hover:bg-[#40414f]"
                          onClick={() => jumpToResult(1)}
                        >Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-8">
              <ChatPrompt />
              <div className="w-full px-4">
                <ChatInput onOpenSearch={() => setIsSearchOpen(true)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  )
} 