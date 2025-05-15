import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LucideSend, Search, Upload } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useActiveConversation } from '@/hooks/use-active-conversation'
import { useCreateConversation } from '@/hooks/use-create-conversation'
import { useCreateMessage, updateMessage } from '@/hooks/use-create-message'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabase/client'
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream";
import { useMessages } from '@/hooks/use-messages';
import { useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/types/supabase';
import { useConversationModelStore } from '@/hooks/use-conversation-model-store'
import { createPortal } from 'react-dom'
import { usePremiumQueryCountStore } from '@/hooks/use-premium-query-count-store'
import { toast } from 'react-hot-toast'

console.log('ChatInput mounted');

type PendingMessage = {
  content: string;
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    filePath: string;
    url: string;
    status: 'pending' | 'uploaded' | 'error';
    error?: string;
    base64?: string;
  }>;
  model: string | null;
  messages: { role: string; content: string }[];
};

const ChatInput = React.memo(function ChatInput({ onOpenSearch, defaultModel }: { onOpenSearch?: () => void, defaultModel?: string }) {
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
  const [uploadError] = useState<string | null>(null)
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
    base64?: string;
  }>>([])
  const { data: messages } = useMessages(activeConversationId);
  const queryClient = useQueryClient();
  const selectedModelRaw = useConversationModelStore(s => activeConversationId ? s.getModel(activeConversationId) : undefined)
  const selectedModel = selectedModelRaw ?? null
  const pendingQueue = useRef<PendingMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false)
  const decrementPremiumCount = usePremiumQueryCountStore(s => s.decrement)

  const handleRemoveAttachment = (filePath: string) => {
    setPendingAttachments(prev => prev.filter(a => a.filePath !== filePath))
  }

  useEffect(() => {
    if (activeConversationId && !activeConversationId.startsWith('temp-') && pendingQueue.current.length > 0) {
      // Flush all queued messages
      pendingQueue.current.forEach(async (item) => {
        const msg = await createMessage.mutateAsync({ conversation_id: activeConversationId, content: item.content, role: 'user' });
        for (const att of item.attachments) {
          await supabase.from('attachments').insert({
            file_name: att.name,
            file_path: att.filePath,
            file_size: att.size,
            file_type: att.type,
            message_id: msg.id,
          });
        }
        const assistantMsg = await createMessage.mutateAsync({ conversation_id: activeConversationId, content: '', role: 'assistant' });
        const imageUrls = item.attachments.filter((att: { type: string }) => att.type.startsWith('image/')).map((att: { url: string }) => att.url);
        const res = await fetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({ messages: item.messages, conversation_id: activeConversationId, model: item.model, attachments: imageUrls }),
        });
        if (res.body) {
          ChatCompletionStream.fromReadableStream(res.body)
            .on('content', (delta, content) => {
              updateMessage(assistantMsg.id, content).catch(() => {});
              queryClient.setQueryData<Database['public']['Tables']['messages']['Row'][]>(['messages', activeConversationId], (old) => {
                if (!old) return old;
                return old.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content } : m
                );
              });
            });
        }
      });
      pendingQueue.current = [];
      setPendingMessages([]);
    }
  }, [activeConversationId]);

  return (
    <>
      {showLimitModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70" onClick={() => setShowLimitModal(false)}>
          <div className="bg-[#23272f] text-[#ececf1] rounded-2xl shadow-2xl border border-[#353740] p-8 min-w-[340px] max-w-full relative w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-[#b4bcd0] hover:text-[#ececf1] text-xl font-bold" onClick={() => setShowLimitModal(false)} aria-label="Close">
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Daily Limit Reached</h2>
            <div className="mb-4 text-[#b4bcd0]">You&apos;ve hit your 50 daily queries for premium models.<br/>Add your own API key in <b>Settings</b> for unlimited access.</div>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded" onClick={() => { setShowLimitModal(false); document.querySelector('[aria-label="Settings"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })) }}>Open Settings</button>
          </div>
        </div>,
        document.body
      )}
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
          console.log('Form submitted');
          e.preventDefault();
          setError(null)
          const content = inputValue.trim()
          if (!content && pendingAttachments.length === 0) {
            console.log('No content or attachments, returning early');
            return;
          }
          // Query limit check for premium models
          if (selectedModel && !/free/i.test(selectedModel)) {
            try {
              const res = await fetch('/api/user-settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: selectedModel }),
              })
              if (res.status === 403) {
                setShowLimitModal(true)
                toast.error('You have hit your daily premium query limit. Add your own API key in Settings for unlimited access.')
                return
              }
              decrementPremiumCount()
            } catch {
              setError('Failed to check query limit')
              return
            }
          }
          try {
            let conversationId = activeConversationId
            if (!conversationId) {
              if (userId && !createConversation.isPending) {
                const conv = await createConversation.mutateAsync({ user_id: userId, model: defaultModel || '' })
                setActiveConversationId(conv.id)
                conversationId = conv.id
                // Wait for the real conversation ID before proceeding
                if (!conversationId || conversationId.startsWith('temp-')) {
                  // Queue the message and attachments
                  pendingQueue.current.push({
                    content,
                    attachments: [...pendingAttachments],
                    model: selectedModel,
                    messages: [
                      ...(messages?.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })) || []),
                      { role: 'user', content }
                    ],
                  });
                  setPendingMessages([
                    ...pendingMessages,
                    {
                      content,
                      attachments: [...pendingAttachments],
                      model: selectedModel,
                      messages: [
                        ...(messages?.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })) || []),
                        { role: 'user', content }
                      ],
                    },
                  ]);
                  setInputValue('');
                  setPendingAttachments([]);
                  return;
                }
              } else {
                setError('No conversation available')
                console.log('No conversation available, returning early');
                return
              }
            }
            // Only proceed if conversationId is a real UUID
            if (!conversationId || conversationId.startsWith('temp-')) {
              setError('Invalid conversation. Please try again.');
              return;
            }
            // Create the user message
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
            // Use the latest messages (including the new user message)
            const currentMessages = [
              ...(messages?.map(m => ({ role: m.role, content: m.content })) || []),
              { role: 'user', content }
            ];
            // Add a placeholder assistant message
            console.log('Creating assistant message...');
            const assistantMsg = await createMessage.mutateAsync({ conversation_id: conversationId, content: '', role: 'assistant' });
            console.log('Assistant message created:', assistantMsg);
            let streamedContent = '';
            let res;
            // Only use base64 for Together AI attachments
            const togetherAttachments = pendingAttachments
              .filter(att => att.type.startsWith('image/') && att.base64)
              .map(att => att.base64)
            try {
              res = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ messages: currentMessages, conversation_id: conversationId, model: selectedModel, attachments: togetherAttachments }),
              });
              console.log('API response:', res);
            } catch (err) {
              console.error('Fetch to /api/chat failed:', err);
              setError('Failed to contact LLM API');
              toast.error('Failed to contact Together.AI. Please try again later.')
              return;
            }
            if (!res.body) {
              toast.error('No response from Together.AI. Please try again later.')
              throw new Error('No response body');
            }
            if (res.body) {
              ChatCompletionStream.fromReadableStream(res.body)
                .on('content', (delta, content) => {
                  streamedContent = content;
                  console.log('Streaming content:', content);
                  updateMessage(assistantMsg.id, streamedContent).catch(e => {
                    console.error('updateMessage error:', e);
                  });
                  queryClient.setQueryData<Database['public']['Tables']['messages']['Row'][]>(['messages', conversationId], (old) => {
                    if (!old) return old;
                    return old.map((m) =>
                      m.id === assistantMsg.id ? { ...m, content: streamedContent } : m
                    );
                  });
                })
                .on('end', () => {
                  console.log('Streaming ended');
                  // No refetch; rely on optimistic cache update
                });
            }
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
        {/* File preview row inside the input box, at the top */}
        <div className="flex items-center gap-4 mb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#353740] scrollbar-track-transparent">
          {pendingAttachments.map(att => {
            console.log('preview row map', att)
            return (
              <div
                key={att.filePath || att.name || att.base64 || Math.random()}
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
                {/* Filename overlay at bottom (always show, even on error) */}
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
            {[Search].map((Icon, i) => (
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
                    {["Search"][i]}
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
        {/* Hidden file input for upload icon */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/webp"
          onChange={async e => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            const file = files[0];
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
              setPendingAttachments(prev => [
                ...prev,
                {
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  filePath: '',
                  url: '',
                  status: 'error',
                  error: 'Unsupported file type',
                }
              ]);
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setPendingAttachments(prev => [
                ...prev,
                {
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  filePath: '',
                  url: '',
                  status: 'error',
                  error: 'File too large',
                }
              ]);
              return;
            }
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            setPendingAttachments(prev => [
              ...prev,
              {
                name: file.name,
                type: file.type,
                size: file.size,
                filePath: '',
                url: base64,
                status: 'uploaded',
                base64,
              }
            ]);
          }}
          disabled={createConversation.isPending || createMessage.isPending}
        />
        <style jsx global>{`
          input::placeholder {
            color: #b4bcd0 !important;
            opacity: 1;
          }
        `}</style>
      </form>
    </>
  )
})

export default ChatInput 