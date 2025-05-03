import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { useEffect } from 'react'

export function useConversations(userId: string | undefined) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations', userId] })
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false })
      if (error) throw error
      return data as Database['public']['Tables']['conversations']['Row'][]
    },
    enabled: !!userId,
  })
} 