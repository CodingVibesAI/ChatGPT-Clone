import { LucidePlus, Menu } from 'lucide-react'
import { useCreateConversation } from '@/hooks/use-create-conversation'
import { useActiveConversation } from '@/hooks/use-active-conversation'

export default function SidebarHeader({ open, setOpen, userId, defaultModel }: { open: boolean, setOpen: (open: boolean) => void, userId?: string, defaultModel?: string }) {
  const setActiveConversationId = useActiveConversation(s => s.setActiveConversationId)
  const createConversation = useCreateConversation({
    onSuccess: (data) => {
      setActiveConversationId(data.id)
    },
  })
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
          onClick={() => {
            if (userId && !createConversation.isPending) {
              createConversation.mutate({ user_id: userId, model: defaultModel || 'ssss' })
            }
          }}
          aria-label="New chat"
        >
          <LucidePlus size={22} />
        </button>
      </div>
    </div>
  )
} 