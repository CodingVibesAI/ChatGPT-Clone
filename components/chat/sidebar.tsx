import SidebarHeader from './sidebar-header'
import { Button } from '@/components/ui/button'
import { LucidePlus, ChevronDown, LucideSearch, User, MessageSquare, MoreHorizontal } from 'lucide-react'

const conversations = [
  { id: 1, title: 'Vibe Coding', dateGroup: 'Previous 7 Days' },
  { id: 2, title: 'AlgoTrading101', dateGroup: 'Previous 7 Days' },
]

const dateGroups = [
  { label: 'Today', items: [] },
  { label: 'Yesterday', items: [] },
  { label: 'Previous 7 Days', items: conversations },
  { label: 'Previous 30 Days', items: [] },
]

export default function Sidebar() {
  return (
    <aside className="w-[260px] bg-[#202123] border-r border-[#2a2b32] flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-[#202123]">
        <SidebarHeader />
        <div className="flex flex-col gap-1 px-2 pt-1 pb-2 border-b border-[#2a2b32]">
          <Button className="w-full flex items-center gap-2 bg-[#343541] text-white font-medium rounded-md px-3 h-8 min-h-0 justify-start text-[15px] shadow-none border-none hover:bg-[#2a2b32] focus:bg-[#2a2b32] transition-colors">
            <LucidePlus size={16} className="text-[#b4bcd0]" />
            New chat
            <ChevronDown size={13} className="ml-auto text-[#b4bcd0]" />
          </Button>
          <div className="relative mt-1">
            <input
              className="w-full h-8 rounded-md bg-[#202123] text-[15px] text-white px-3 pr-8 border-none outline-none placeholder:text-[#8e8ea0] focus:ring-2 focus:ring-[#353740]"
              placeholder="Search..."
              type="text"
            />
            <LucideSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-[#b4bcd0]" size={16} />
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {dateGroups.map((group) => (
          group.items.length > 0 && (
            <div key={group.label}>
              <div className="text-xs text-[#8e8ea0] px-2 py-1 mt-2 mb-1 font-medium tracking-wide uppercase">{group.label}</div>
              <ul className="space-y-1">
                {group.items.map((conv) => (
                  <li key={conv.id}>
                    <div className="group">
                      <Button variant="ghost" className="w-full flex items-center gap-2 justify-start text-left text-white rounded-md px-2.5 py-2 hover:bg-[#343541] focus:bg-[#343541] transition-colors h-9 min-h-0 bg-transparent border-none shadow-none text-[15px] font-normal">
                        <MessageSquare size={16} className="text-[#b4bcd0]" />
                        <span className="truncate flex-1">{conv.title}</span>
                        <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={16} className="text-[#b4bcd0]" />
                        </span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        ))}
      </nav>
      <div className="flex items-center gap-2 p-3 border-t border-[#2a2b32] text-xs text-[#8e8ea0] mt-auto">
        <div className="w-8 h-8 rounded-full bg-[#202123] flex items-center justify-center cursor-pointer hover:bg-[#343541] border border-[#353740] transition-colors">
          <User size={16} className="text-[#b4bcd0]" />
        </div>
        <span className="font-medium text-white text-[15px]">N</span>
        <Button variant="ghost" size="icon" className="ml-auto text-[#b4bcd0] hover:bg-[#343541]">
          <MoreHorizontal size={16} />
        </Button>
      </div>
    </aside>
  )
} 