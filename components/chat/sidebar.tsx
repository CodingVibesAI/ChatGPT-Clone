import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LucidePlus, LucideSearch, Menu, User, MessageSquare, MoreHorizontal } from 'lucide-react'

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

export default function Sidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <aside
      className={`h-full w-full z-30 bg-[#202123] border-r border-[#2a2b32] flex flex-col transition-all duration-200`}
      style={{ boxShadow: open ? "2px 0 8px 0 rgba(0,0,0,0.08)" : "none" }}
    >
      {open ? (
        <>
          <div className="flex flex-row items-center justify-between py-4 px-2">
            <button
              className="w-10 h-10 flex items-center justify-center text-[#ececf1] hover:bg-[#343541] rounded-lg"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
            >
              <Menu size={22} />
            </button>
            <div className="flex flex-row items-center gap-2 ml-auto">
              <button
                className="w-10 h-10 flex items-center justify-center text-[#ececf1] hover:bg-[#343541] rounded-lg"
                onClick={() => {/* new chat logic */}}
                aria-label="New chat"
              >
                <LucidePlus size={22} />
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center text-[#ececf1] hover:bg-[#343541] rounded-lg"
                onClick={() => setShowSearch(true)}
                aria-label="Search"
              >
                <LucideSearch size={22} />
              </button>
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
          {/* Search modal */}
          {showSearch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-[#353740] rounded-xl p-6 w-full max-w-md">
                <input
                  className="w-full bg-transparent border-b border-[#ececf1] text-[#ececf1] placeholder-[#b4bcd0] py-2 px-3 outline-none"
                  placeholder="Search..."
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        // Mini sidebar: toggle and new chat only
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
            onClick={() => {/* new chat logic */}}
            aria-label="New chat"
          >
            <LucidePlus size={22} />
          </button>
        </div>
      )}
    </aside>
  )
} 