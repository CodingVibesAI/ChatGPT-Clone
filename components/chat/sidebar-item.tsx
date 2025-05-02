import { Button } from '@/components/ui/button'
import { MessageSquare, MoreHorizontal } from 'lucide-react'

export default function SidebarItem({ conv }: { conv: { id: number, title: string } }) {
  return (
    <li>
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
  )
} 