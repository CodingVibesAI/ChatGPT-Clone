import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

export function useMessages(conversationId?: string | null) {
  const isRealConversation = !!conversationId && !conversationId.startsWith('temp-')
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!isRealConversation) return []
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*, attachments:attachments(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return messages as Array<Database['public']['Tables']['messages']['Row'] & { attachments: Database['public']['Tables']['attachments']['Row'][] }>
    },
    enabled: isRealConversation,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: [],
    refetchOnWindowFocus: false,
  })
} 