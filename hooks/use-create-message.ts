import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

export function useCreateMessage(options?: UseMutationOptions<
  Database['public']['Tables']['messages']['Row'],
  unknown,
  {
    conversation_id: string
    content: string
    role: string
  }
>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      conversation_id: string
      content: string
      role: string
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: input.conversation_id,
          content: input.content,
          role: input.role,
        })
        .select()
        .single()
      if (error) throw error
      return data as Database['public']['Tables']['messages']['Row']
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversation_id] })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
} 