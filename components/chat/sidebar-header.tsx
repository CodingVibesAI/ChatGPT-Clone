import { LucidePlus, LucideSearch, Menu } from 'lucide-react'

export default function SidebarHeader({ open, setOpen, setShowSearch }: { open: boolean, setOpen: (open: boolean) => void, setShowSearch: (v: boolean) => void }) {
  return (
    <div className="flex flex-row items-center justify-between py-4 px-2">
      <button
        className="w-10 h-10 flex items-center justify-center text-[#ececf1] hover:bg-[#343541] rounded-lg"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
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
  )
} 