import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

export function useMessages(conversationId?: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return []
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Database['public']['Tables']['messages']['Row'][]
    },
    enabled: !!conversationId,
  })
} 