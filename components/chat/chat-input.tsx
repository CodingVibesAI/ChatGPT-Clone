import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { LucideSend, Globe, Image as ImageIcon, Search, MoreHorizontal, Upload } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useActiveConversation } from '@/hooks/use-active-conversation'
import { useCreateConversation } from '@/hooks/use-create-conversation'
import { useCreateMessage } from '@/hooks/use-create-message'
import { useUser } from '@supabase/auth-helpers-react'
import { createSupabaseClient } from '@/lib/supabase/client'

const ChatInput = React.memo(function ChatInput({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const activeConversationId = useActiveConversation(s => s.activeConversationId)
  const setActiveConversationId = useActiveConversation(s => s.setActiveConversationId)
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
  const [inputValue, setInputValue] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<Array<{
    name: string;
    type: string;
    size: number;
    filePath: string;
    url: string;
    status: 'pending' | 'uploaded' | 'error';
    error?: string;
  }>>([])
  const supabaseRef = useRef(createSupabaseClient())
  const supabase = supabaseRef.current
  const [, forceRerender] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange', e.target.files)
    setUploadError(null)
    const files = e.target.files
    if (!files || files.length === 0) return
    const allowed = [
      'image/png', 'image/jpeg', 'image/webp', 'application/pdf',
      'text/plain', 'application/zip', 'application/json',
    ]
    for (const file of Array.from(files)) {
      if (!allowed.includes(file.type)) {
        setUploadError('Unsupported file type')
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File too large (max 10MB)')
        continue
      }
      // Optimistically add preview
      let localUrl = ''
      if (typeof window !== 'undefined' && typeof window.URL !== 'undefined' && typeof window.URL.createObjectURL === 'function') {
        localUrl = window.URL.createObjectURL(file)
      } else {
        // fallback for test/SSR
        localUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...'
      }
      const ext = file.name.split('.').pop()
      const filePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      setPendingAttachments(prev => {
        const next: typeof prev = [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            filePath,
            url: localUrl,
            status: 'pending' as const,
          },
        ]
        return next
      })
      forceRerender(n => n + 1)
      // Start upload in background
      void (async () => {
        try {
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })
          if (uploadError) {
            setPendingAttachments(prev => prev.map(a =>
              a.filePath === filePath ? { ...a, status: 'error', error: uploadError.message } : a
            ))
            return
          }
          const { data } = supabase.storage.from('attachments').getPublicUrl(filePath)
          setPendingAttachments(prev => prev.map(a =>
            a.filePath === filePath ? { ...a, url: data.publicUrl, status: 'uploaded' } : a
          ))
        } catch {
          setPendingAttachments(prev => prev.map(a =>
            a.filePath === filePath ? { ...a, status: 'error', error: 'Upload failed' } : a
          ))
        }
      })()
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
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
        const content = inputValue.trim()
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
          setInputValue('')
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
      {uploadError && <div className="text-xs text-red-500 mb-2">{uploadError}</div>}
      {/* Hidden file input for upload icon */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp,application/pdf,text/plain,application/zip,application/json"
        onChange={handleFileChange}
        disabled={createConversation.isPending || createMessage.isPending}
        multiple
      />
      {/* File preview row inside the input box, at the top */}
      <div className="flex items-center gap-4 mb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#353740] scrollbar-track-transparent">
        {pendingAttachments.map(att => {
          console.log('preview row map', att)
          return (
            <div
              key={att.filePath}
              className={`relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-[#23272f] border border-[#353740] group`}
            >
              {/* Status indicator (spinner or error) */}
              {att.status === 'pending' && (
                <span className="absolute -top-3 -left-3 w-7 h-7 flex items-center justify-center bg-[#23272f] rounded-full shadow animate-spin text-[#b4bcd0] z-20 border-2 border-[#353740]">⏳</span>
              )}
              {att.status === 'error' && (
                <span className="absolute -top-3 -left-3 w-7 h-7 flex items-center justify-center bg-[#23272f] rounded-full shadow text-red-500 z-20 border-2 border-[#353740]">!</span>
              )}
              {/* Remove X button */}
              <button
                type="button"
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-[#353740] text-[#ececf1] hover:bg-red-500 hover:text-white text-sm border-2 border-[#23272f] shadow z-20"
                onClick={() => handleRemoveAttachment(att.filePath)}
                aria-label="Remove attachment"
                tabIndex={0}
              >
                ×
              </button>
              {/* File preview (image or icon) */}
              {att.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(att.name) ? (
                <img src={att.url} alt={att.name} className="object-cover w-full h-full" />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-3xl text-[#b4bcd0]">📄</span>
              )}
              {/* Filename overlay at bottom */}
              <div data-testid="attachment-filename" className="absolute bottom-0 left-0 w-full px-2 py-1 bg-gradient-to-t from-black/80 to-black/0 text-[11px] text-[#ececf1] truncate pointer-events-none font-medium">
                {att.name}
              </div>
            </div>
          )
        })}
      </div>
      {/* Text input */}
      <div className="flex items-center w-full">
        <input
          ref={chatInputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
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
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
      </div>
      {/* Action buttons at the bottom in a single row */}
      <div className="flex items-center justify-between pt-1 w-full">
        <div className="flex gap-1">
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
      <style jsx global>{`
        input::placeholder {
          color: #b4bcd0 !important;
          opacity: 1;
        }
      `}</style>
    </form>
  )
})

export default ChatInput 