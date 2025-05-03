import { Button } from '@/components/ui/button'
import { LucideSend, Globe, Image as ImageIcon, Search, MoreHorizontal, Upload } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useActiveConversation } from '@/hooks/use-active-conversation'
import { useCreateConversation } from '@/hooks/use-create-conversation'
import { useCreateMessage } from '@/hooks/use-create-message'
import { useUser } from '@supabase/auth-helpers-react'
import { useState } from 'react'

export default function ChatInput() {
  const { activeConversationId, setActiveConversationId } = useActiveConversation()
  const user = useUser()
  const userId = user?.id
  const createConversation = useCreateConversation({
    onSuccess: (conv) => {
      setActiveConversationId(conv.id)
    },
  })
  const createMessage = useCreateMessage()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="w-full max-w-[700px] mx-auto relative flex flex-col gap-0"
      style={{
        background: "#40414f",
        borderRadius: "16px",
        border: "1px solid #353740",
        minHeight: 48,
        boxShadow: "0 4px 32px 0 rgba(0,0,0,0.08)",
        padding: "0.75rem 1.25rem",
        fontFamily: "var(--font-sans)",
        fontSize: 16,
      }}
      onSubmit={async e => {
        e.preventDefault();
        setError(null)
        const input = e.currentTarget.querySelector('input');
        if (input && input.value.trim()) {
          const content = input.value.trim()
          try {
            if (!activeConversationId) {
              if (userId && !createConversation.isPending) {
                // TODO: Don't hardcode model
                const conv = await createConversation.mutateAsync({ user_id: userId, model: 'GPT-4o' })
                setActiveConversationId(conv.id)
                await createMessage.mutateAsync({ conversation_id: conv.id, content, role: 'user' })
              }
            } else {
              await createMessage.mutateAsync({ conversation_id: activeConversationId, content, role: 'user' })
            }
            input.value = '';
          } catch (err: unknown) {
            // Log the error for debugging
            console.error('Chat send error:', err)
            if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
              setError((err as { message: string }).message)
            } else if (typeof err === 'string') {
              setError(err)
            } else {
              setError(JSON.stringify(err))
            }
          }
        }
      }}
    >
      {error && (
        <div className="text-sm text-red-500 mb-2">{error}</div>
      )}
      <div className="flex items-center gap-2 w-full">
       
        <input
          className="flex-1 bg-transparent border-none outline-none rounded-full px-3 py-2 text-[16px] min-h-[24px] max-h-40 transition-colors"
          style={{
            color: "#ececf1",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: "1.5",
            letterSpacing: "0",
            boxShadow: "none",
          }}
          placeholder="Ask anything"
          autoComplete="off"
        />
        <style jsx global>{`
          input::placeholder {
            color: #b4bcd0 !important;
            opacity: 1;
          }
        `}</style>
      </div>
      <div className="flex items-center justify-between pt-1 w-full">
        <div className="flex gap-1">
          {[Upload, Search, Globe, ImageIcon, MoreHorizontal].map((Icon, i) => (
            
            <Tooltip.Root key={i} delayDuration={200}>
              <Tooltip.Trigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 text-[#ececf1] bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
                >
                  <Icon size={18} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  sideOffset={8}
                  className="px-3 py-1.5 rounded-md text-xs shadow-lg border z-50"
                  style={{
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {["Upload", "Search", "Deep research", "Create image", "More"][i]}
                  <Tooltip.Arrow className="fill-[var(--popover)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}
        </div>
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="rounded-full w-12 h-12 flex items-center justify-center ml-auto text-[#ececf1] bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
              style={{
                color: "#ececf1",
                background: "transparent",
                border: "none",
                boxShadow: "none",
              }}
            >
              <LucideSend size={20} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              sideOffset={8}
              className="px-3 py-1.5 rounded-md text-xs shadow-lg border z-50"
              style={{
                background: "#23272f",
                color: "#ececf1",
                borderColor: "#353740",
                fontFamily: "var(--font-sans)",
              }}
            >
              Send
              <Tooltip.Arrow className="fill-[#23272f]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </form>
  )
} 