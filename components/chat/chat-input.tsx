import { Button } from '@/components/ui/button'
import { LucideSend, Globe, Image as ImageIcon, Search, MoreHorizontal, Upload } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useActiveConversation } from '@/hooks/use-active-conversation'
import { useCreateConversation } from '@/hooks/use-create-conversation'
import { useCreateMessage } from '@/hooks/use-create-message'
import { useUser } from '@supabase/auth-helpers-react'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ChatInput({ onOpenSearch }: { onOpenSearch?: () => void }) {
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
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const [pendingAttachments, setPendingAttachments] = useState<Array<{ name: string; type: string; size: number; filePath: string; url: string }>>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    const file = e.target.files?.[0]
    if (!file) return
    // Validate type/size
    const allowed = [
      'image/png', 'image/jpeg', 'image/webp', 'application/pdf',
      'text/plain', 'application/zip', 'application/json',
    ]
    if (!allowed.includes(file.type)) {
      setUploadError('Unsupported file type')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large (max 10MB)')
      return
    }
    try {
      // Upload to Supabase Storage
      const ext = file.name.split('.').pop()
      const filePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (uploadError) {
        setUploadError(uploadError.message)
        return
      }
      const { data } = supabase.storage.from('attachments').getPublicUrl(filePath)
      setPendingAttachments(prev => [
        ...prev,
        { name: file.name, type: file.type, size: file.size, filePath, url: data.publicUrl }
      ])
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        setUploadError((err as { message: string }).message)
      } else if (typeof err === 'string') {
        setUploadError(err)
      } else {
        setUploadError('Upload failed')
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveAttachment = (filePath: string) => {
    setPendingAttachments(prev => prev.filter(a => a.filePath !== filePath))
  }

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
        const input = chatInputRef.current;
        const content = input && input.value.trim() ? input.value.trim() : ''
        if (!content && pendingAttachments.length === 0) return
        try {
          let conversationId = activeConversationId
          if (!conversationId) {
            if (userId && !createConversation.isPending) {
              const conv = await createConversation.mutateAsync({ user_id: userId, model: 'GPT-4o' })
              setActiveConversationId(conv.id)
              conversationId = conv.id
            } else {
              setError('No conversation available')
              return
            }
          }
          // Create the message
          const msg = await createMessage.mutateAsync({ conversation_id: conversationId, content, role: 'user' })
          // Insert all pending attachments
          for (const att of pendingAttachments) {
            await supabase.from('attachments').insert({
              file_name: att.name,
              file_path: att.filePath,
              file_size: att.size,
              file_type: att.type,
              message_id: msg.id,
            })
          }
          if (input) input.value = ''
          setPendingAttachments([])
        } catch (err: unknown) {
          if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
            setError((err as { message: string }).message)
          } else if (typeof err === 'string') {
            setError(err)
          } else {
            setError('Send failed')
          }
        }
      }}
    >
      {error && (
        <div className="text-sm text-red-500 mb-2">{error}</div>
      )}
      {/* Pending attachments preview */}
      {pendingAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {pendingAttachments.map(att => (
            <div key={att.filePath} className="relative flex items-center bg-[#23272f] border border-[#353740] rounded px-3 py-2 text-xs text-[#ececf1] max-w-[200px]">
              <span className="truncate max-w-[140px]">{att.name}</span>
              <button
                type="button"
                className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-[#353740] text-[#ececf1] hover:bg-red-500 hover:text-white text-xs"
                onClick={() => handleRemoveAttachment(att.filePath)}
                aria-label="Remove attachment"
                tabIndex={0}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Hidden file input for upload icon */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp,application/pdf,text/plain,application/zip,application/json"
        onChange={handleFileChange}
        disabled={createConversation.isPending || createMessage.isPending}
      />
      {uploadError && <div className="text-xs text-red-500 mb-2">{uploadError}</div>}
      <div className="flex items-center gap-2 w-full">
       
        <input
          ref={chatInputRef}
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
          {/* Upload icon triggers file input */}
          <Tooltip.Root delayDuration={200}>
            <Tooltip.Trigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="w-10 h-10 text-[#ececf1] bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload file"
              >
                <Upload size={18} />
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
                Upload
                <Tooltip.Arrow className="fill-[var(--popover)]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          {/* Other icons */}
          {[Search, Globe, ImageIcon, MoreHorizontal].map((Icon, i) => (
            <Tooltip.Root key={i} delayDuration={200}>
              <Tooltip.Trigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 text-[#ececf1] bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
                  onClick={i === 0 && onOpenSearch ? onOpenSearch : undefined}
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
                  {["Search", "Web search", "Create image", "More"][i]}
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