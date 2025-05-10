"use client";
import Sidebar from '@/components/chat/sidebar'
import ChatArea from '@/components/chat/chat-area'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { useState } from 'react'

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

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