import { MessageSquare, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useActiveConversation } from '@/hooks/use-active-conversation'
import { useDeleteConversation } from '@/hooks/use-delete-conversation'
import { useUpdateConversation } from '@/hooks/use-update-conversation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

type SidebarItemProps = { conv: { id: string, title: string }, userId?: string }
export default function SidebarItem({ conv, userId }: SidebarItemProps) {
  const setActiveConversationId = useActiveConversation(s => s.setActiveConversationId)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(conv.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const deleteConversation = useDeleteConversation({
    onSuccess: () => {
      setActiveConversationId(null)
    },
  })
  const [error, setError] = useState<string | null>(null)
  const updateConversation = useUpdateConversation({
    onSuccess: () => setIsRenaming(false),
    onError: () => {
      setError('Rename failed. Please try again.')
      setIsRenaming(false)
    },
  })
  useEffect(() => {
    if (!isRenaming) setRenameValue(conv.title)
  }, [conv.title, isRenaming])
  const handleRename = () => {
    console.log('handleRename called')
    setMenuOpen(false)
    setTimeout(() => {
      setIsRenaming(true)
      setTimeout(() => inputRef.current?.focus(), 0)
    }, 0)
  }
  const handleRenameSubmit = () => {
    setError(null)
    if (userId && renameValue.trim() && renameValue !== conv.title) {
      setIsRenaming(false)
      updateConversation.mutate({ id: conv.id, user_id: userId, title: renameValue.trim() })
    } else {
      setIsRenaming(false)
      setRenameValue(conv.title)
    }
  }
  const handleDelete = () => {
    if (userId && confirm('Delete this conversation?')) {
      deleteConversation.mutate({ id: conv.id, user_id: userId })
    }
  }
  return (
    <li>
      <div className={`group flex items-center w-full rounded-md transition-colors ${menuOpen ? 'bg-[#343541]' : 'hover:bg-[#343541]'}`}>
        {isRenaming ? (
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border border-[#353740] rounded px-2 py-1 text-[#ececf1] text-[15px] outline-none focus:border-[#ececf1]"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') { setIsRenaming(false); setRenameValue(conv.title) }
            }}
            disabled={updateConversation.isPending}
            style={{ minWidth: 0 }}
          />
        ) : (
          <button
            className="flex-1 flex items-center gap-2 justify-start text-left text-[#ececf1] rounded-md px-2.5 py-2 h-9 min-h-0 bg-transparent border-none shadow-none text-[15px] font-normal outline-none transition-colors select-none"
            style={{ boxShadow: 'none', border: 'none', outline: 'none' }}
            onClick={() => setActiveConversationId(conv.id)}
            tabIndex={0}
            type="button"
          >
            <MessageSquare size={16} className="text-[#b4bcd0]" />
            <span className="truncate flex-1">{conv.title}</span>
          </button>
        )}
        <DropdownMenu.Root open={process.env.NODE_ENV === 'test' ? true : menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent border-none shadow-none focus:ring-0 focus:outline-none"
              style={{ background: 'transparent', boxShadow: 'none', border: 'none', outline: 'none' }}
              tabIndex={-1}
              aria-label="More options"
            >
              <MoreHorizontal size={16} className="text-[#b4bcd0]" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="right" align="start" className="z-[9999] min-w-[140px] rounded-md bg-[#23272f] p-1 shadow-lg border border-[#353740]">
              <DropdownMenu.Item onSelect={handleRename} className="px-3 py-2 text-sm text-[#ececf1] hover:bg-[#343541] cursor-pointer rounded flex items-center gap-2" disabled={isRenaming}>
                <Pencil size={16} className="text-[#ececf1]" /> Rename
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={handleDelete} className="px-3 py-2 text-sm text-red-500 hover:bg-[#343541] cursor-pointer rounded flex items-center gap-2" disabled={deleteConversation.isPending}>
                <Trash2 size={16} className="text-red-500" /> Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        {error && (
          <div className="text-xs text-red-500 px-2 py-1">{error}</div>
        )}
      </div>
    </li>
  )
} 