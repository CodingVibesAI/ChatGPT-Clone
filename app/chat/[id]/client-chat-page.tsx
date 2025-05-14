'use client'
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/chat/sidebar'
import ChatArea from '@/components/chat/chat-area'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { useActiveConversation } from '@/hooks/use-active-conversation'

export default function ClientChatPage({ id }: { id: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const setActiveConversationId = useActiveConversation(s => s.setActiveConversationId)
  useEffect(() => {
    if (id) setActiveConversationId(id)
  }, [id, setActiveConversationId])
  if (!id) return <div className="flex items-center justify-center h-screen text-lg">Invalid conversation</div>
  return (
    <div className="flex h-screen w-full bg-gradient-to-b from-[#23272f] via-[#202123] to-[#131313] relative">
      {/* Sidebar as flex child, always rendered, mini when closed */}
      <div className={`transition-all duration-200 h-full ${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} flex-shrink-0 overflow-hidden`}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>
      <main className="flex-1 min-w-0 flex flex-col h-screen">
        <Header />
        <div className="flex-1 min-h-0 flex flex-col">
          <ChatArea />
        </div>
        <Footer />
      </main>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <aside className="absolute left-0 top-0 w-[260px] h-full bg-[#202123] shadow-lg">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          </aside>
        </div>
      )}
    </div>
  )
} 