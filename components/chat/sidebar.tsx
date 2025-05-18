"use client";
import { useState } from 'react'
import SidebarHeader from './sidebar-header'
import SidebarList from './sidebar-list'
import SidebarFooter from './sidebar-footer'
import { LucidePlus, Menu } from 'lucide-react'
import { useConversations } from '@/hooks/use-conversations'
import type { Conversation } from './sidebar-list'
import { useUser } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCreateConversation } from '@/hooks/use-create-conversation'
import { useActiveConversation } from '@/hooks/use-active-conversation'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function groupConversations(convs: Conversation[]): { label: string, items: Conversation[] }[] {
  const now = new Date()
  const today: Conversation[] = []
  const prev7: Conversation[] = []
  const prev30: Conversation[] = []
  const older: Conversation[] = []
  convs.forEach(conv => {
    const d = new Date(conv.created_at)
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 1) today.push(conv)
    else if (diff < 7) prev7.push(conv)
    else if (diff < 30) prev30.push(conv)
    else older.push(conv)
  })
  return [
    { label: 'Today', items: today },
    { label: 'Previous 7 Days', items: prev7 },
    { label: 'Previous 30 Days', items: prev30 },
    { label: 'Older', items: older },
  ]
}

function MiniSidebar({ setOpen, userId, defaultModel }: { setOpen: (open: boolean) => void, userId?: string, defaultModel?: string }) {
  const setActiveConversationId = useActiveConversation(s => s.setActiveConversationId)
  const createConversation = useCreateConversation({
    onSuccess: (data) => {
      setActiveConversationId(data.id)
    },
  })
  return (
    <div className="flex flex-col items-center py-4 gap-2">
      <button
        className="w-10 h-10 flex items-center justify-center text-[#ececf1] hover:bg-[#343541] rounded-lg"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </button>
      <button
        className="w-10 h-10 flex items-center justify-center text-[#ececf1] hover:bg-[#343541] rounded-lg"
        onClick={() => {
          if (userId && !createConversation.isPending) {
            createConversation.mutate({ user_id: userId, model: defaultModel || '' })
          }
        }}
        aria-label="New chat"
      >
        <LucidePlus size={22} />
      </button>
    </div>
  )
}

export default function Sidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const [search, setSearch] = useState('')
  const user = useUser()
  const userId = user?.id
  const { data, isLoading, isError } = useConversations(userId)
  const { data: models } = useSWR('/api/models', fetcher)
  const defaultModel = models?.[0]?.name
  // Filter conversations by search
  const filtered = (data || []).filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )
  const grouped = groupConversations(filtered)

  return (
    <aside
      className={`h-full w-full z-30 bg-[#202123] border-r border-[#2a2b32] flex flex-col transition-all duration-200`}
      style={{ boxShadow: open ? "2px 0 8px 0 rgba(0,0,0,0.08)" : "none" }}
    >
      {open ? (
        <>
          <SidebarHeader open={open} setOpen={setOpen} userId={userId} />
          {/* Search input always visible */}
          <div className="px-2 pb-2">
            <input
              className="w-full bg-[#353740] border border-[#23272f] rounded-md px-3 py-2 text-[#ececf1] placeholder-[#b4bcd0] outline-none focus:border-[#ececf1] focus:ring-2 focus:ring-[#ececf1] transition"
              placeholder="Search conversations..."
              aria-label="Search conversations"
              value={search}
              onChange={e => setSearch(e.target.value)}
              tabIndex={0}
            />
          </div>
          {!user ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#8e8ea0] gap-4">
              <span className="text-base text-center">Sign in to view your conversations.</span>
              <Link href="/sign-in" passHref>
                <Button variant="secondary" size="lg" className="w-full max-w-[180px]">Sign In</Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center text-[#8e8ea0]">Loading...</div>
          ) : isError ? (
            <div className="flex-1 flex items-center justify-center text-red-500">Error loading conversations</div>
          ) : grouped.every(g => g.items.length === 0) ? (
            <div className="flex-1 flex items-center justify-center text-[#8e8ea0] px-6">No conversations yet. Start a new conversation.</div>
          ) : (
            <SidebarList grouped={grouped} userId={userId} />
          )}
          <SidebarFooter />
        </>
      ) : (
        <MiniSidebar setOpen={setOpen} userId={userId} defaultModel={defaultModel} />
      )}
    </aside>
  )
} 