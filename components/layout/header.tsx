import { Share2, Settings, User, Menu } from 'lucide-react'

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#444654] border-b border-[#2a2b32] h-12 flex items-center px-4 justify-between shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            className="p-2 mr-2 text-[#b4bcd0] rounded hover:bg-[#23272f] transition-colors"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={22} />
          </button>
        )}
        <span className="text-[19px] font-medium text-white tracking-tight select-none">ChatGPT <span className="text-[#b4bcd0] font-medium ml-1">4o</span></span>
      </div>
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-full hover:bg-[#353740] transition-colors text-[#b4bcd0]" aria-label="Share"><Share2 size={20} /></button>
        <button className="p-1.5 rounded-full hover:bg-[#353740] transition-colors text-[#b4bcd0]" aria-label="Settings"><Settings size={20} /></button>
        <button className="p-1.5 rounded-full hover:bg-[#353740] transition-colors text-[#b4bcd0]" aria-label="Profile"><User size={20} /></button>
      </div>
    </header>
  )
} 