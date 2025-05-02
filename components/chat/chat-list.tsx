import ChatMessage from './chat-message'
import React from 'react'

export default function ChatList({ messages }: { messages: { id: number, role: 'user' | 'assistant', content: string }[] }) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {messages.map((msg, idx) => (
        <React.Fragment key={msg.id}>
          <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <ChatMessage role={msg.role} content={msg.content} />
          </div>
          {idx < messages.length - 1 && (
            <div className="w-full h-px bg-[#353740] my-2 opacity-50" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
} 