"use client";
import Sidebar from '@/components/chat/sidebar'
import ChatArea from '@/components/chat/chat-area'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { useState } from 'react'

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen w-full bg-gradient-to-b from-[#23272f] via-[#202123] to-[#131313]">
      {sidebarOpen && (
        <aside className="w-[260px] min-w-[260px] max-w-[260px] h-screen hidden md:block">
          <Sidebar />
        </aside>
      )}
      <main className="flex-1 min-w-0 flex flex-col h-screen">
        <Header onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <div className="flex-1 flex flex-col">
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
            <Sidebar />
          </aside>
        </div>
      )}
    </div>
  )
} 