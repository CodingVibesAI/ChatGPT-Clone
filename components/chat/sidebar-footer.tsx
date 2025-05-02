import { Button } from '@/components/ui/button'
import { User, MoreHorizontal } from 'lucide-react'

export default function SidebarFooter() {
  return (
    <div className="flex items-center gap-2 p-3 border-t border-[#2a2b32] text-xs text-[#8e8ea0] mt-auto">
      <div className="w-8 h-8 rounded-full bg-[#202123] flex items-center justify-center cursor-pointer hover:bg-[#343541] border border-[#353740] transition-colors">
        <User size={16} className="text-[#b4bcd0]" />
      </div>
      <span className="font-medium text-white text-[15px]">N</span>
      <Button variant="ghost" size="icon" className="ml-auto text-[#b4bcd0] hover:bg-[#343541]">
        <MoreHorizontal size={16} />
      </Button>
    </div>
  )
} 