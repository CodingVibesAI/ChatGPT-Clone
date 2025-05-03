"use client";
import ChatInput from './chat-input'
import ChatPrompt from './chat-prompt'
import { useEffect } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import React from 'react'
import { useActiveConversation } from '@/hooks/use-active-conversation'
import { useMessages } from '@/hooks/use-messages'
import ChatList from './chat-list'

export default function ChatArea() {
  const { activeConversationId } = useActiveConversation()
  const { data: messages } = useMessages(activeConversationId)

  // TODO: Scroll to bottom when real messages are implemented
  useEffect(() => {
  }, [])
  // TODO: Don't hardcode model
  return (
    <Tooltip.Provider>
      <div className="relative flex flex-col flex-1 h-full w-full bg-transparent font-sans tracking-normal font-normal">
        {activeConversationId && messages && messages.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto px-0 md:px-0 pt-10 pb-10">
              <ChatList messages={messages} />
            </div>
            <div className="w-full max-w-2xl px-4 mx-auto pb-6">
              <ChatInput />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-8">
              <ChatPrompt />
              <div className="w-full px-4">
                <ChatInput />
              </div>
            </div>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  )
} 