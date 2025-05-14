import { LucidePlus, Menu } from 'lucide-react'
import { useCreateConversation } from '@/hooks/use-create-conversation'
import { useActiveConversation } from '@/hooks/use-active-conversation'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type Model = {
  name: string
  description: string
  price_per_million: number | null
}

export default function SidebarHeader({ open, setOpen, userId }: { open: boolean, setOpen: (open: boolean) => void, userId?: string }) {
  const setActiveConversationId = useActiveConversation(s => s.setActiveConversationId)
  const router = useRouter()
  const { data: models } = useSWR<Model[]>('/api/models', fetcher, { revalidateOnFocus: false })
  const preferredDefault = models?.find(m => /deepseek/i.test(m.name) && /free/i.test(m.name))?.name || models?.[0]?.name
  const createConversation = useCreateConversation({
    onSuccess: (data) => {
      setActiveConversationId(data.id)
      router.push(`/chat/${data.id}`)
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
            if (userId && !createConversation.isPending && preferredDefault) {
              createConversation.mutate({ user_id: userId, model: preferredDefault })
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