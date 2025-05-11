import React from 'react'
import SidebarItem from './sidebar-item'
import type { Database } from '@/types/supabase'
import { useActiveConversation } from '@/hooks/use-active-conversation'

export type Conversation = Database['public']['Tables']['conversations']['Row']

export type SidebarListProps = {
  grouped: { label: string, items: Conversation[] }[]
  userId?: string
}

const SidebarList: React.FC<SidebarListProps> = React.memo(function SidebarList({ grouped, userId }) {
  const activeConversationId = useActiveConversation(s => s.activeConversationId)
  return (
    <nav className="flex-1 overflow-y-auto px-2 py-2">
      {grouped.map((group) => (
        group.items.length > 0 && (
          <div key={group.label}>
            <div className="text-xs text-[#8e8ea0] px-2 py-1 mt-2 mb-1 font-medium tracking-wide uppercase">{group.label}</div>
            <ul className="space-y-1">
              {group.items.map((conv) => (
                <SidebarItem key={conv.id} conv={conv} userId={userId} isActive={conv.id === activeConversationId} />
              ))}
            </ul>
          </div>
        )
      ))}
    </nav>
  )
})

export default SidebarList 