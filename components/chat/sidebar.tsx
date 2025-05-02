import { useState } from 'react'
import SidebarHeader from './sidebar-header'
import SidebarList from './sidebar-list'
import SidebarFooter from './sidebar-footer'
import { LucidePlus, Menu } from 'lucide-react'

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

function MiniSidebar({ setOpen }: { setOpen: (open: boolean) => void }) {
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
        onClick={() => {/* new chat logic */}}
        aria-label="New chat"
      >
        <LucidePlus size={22} />
      </button>
    </div>
  )
}

export default function Sidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <aside
      className={`h-full w-full z-30 bg-[#202123] border-r border-[#2a2b32] flex flex-col transition-all duration-200`}
      style={{ boxShadow: open ? "2px 0 8px 0 rgba(0,0,0,0.08)" : "none" }}
    >
      {open ? (
        <>
          <SidebarHeader open={open} setOpen={setOpen} setShowSearch={setShowSearch} />
          <SidebarList dateGroups={dateGroups} />
          <SidebarFooter />
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
        <MiniSidebar setOpen={setOpen} />
      )}
    </aside>
  )
} 