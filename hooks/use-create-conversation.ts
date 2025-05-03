import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { nanoid } from 'nanoid'

export function useCreateConversation(options?: UseMutationOptions<
  Database['public']['Tables']['conversations']['Row'],
  unknown,
  {
    user_id: string
    model: string
    title?: string
  },
  { previous: Database['public']['Tables']['conversations']['Row'][]; tempId: string }
>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      user_id: string
      model: string
      title?: string
    }) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: input.user_id,
          model: input.model,
          title: input.title ?? 'New Chat',
        })
        .select()
        .single()
      if (error) throw error
      return data as Database['public']['Tables']['conversations']['Row']
    },
    onMutate: async (input): Promise<{ previous: Database['public']['Tables']['conversations']['Row'][]; tempId: string } | undefined> => {
      if (!input.user_id) return undefined
      await queryClient.cancelQueries({ queryKey: ['conversations', input.user_id] })
      const previous = queryClient.getQueryData<Database['public']['Tables']['conversations']['Row'][]>(['conversations', input.user_id]) || []
      const tempId = `temp-${nanoid()}`
      const now = new Date().toISOString()
      const optimistic: Database['public']['Tables']['conversations']['Row'] = {
        id: tempId,
        user_id: input.user_id,
        model: input.model,
        title: input.title ?? 'New Chat',
        created_at: now,
        updated_at: now,
        last_message_at: now,
        archived: false,
      }
      queryClient.setQueryData(['conversations', input.user_id], [optimistic, ...previous])
      return { previous, tempId }
    },
    onError: (_err, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['conversations', input.user_id], context.previous)
      }
    },
    onSuccess: (data, variables, context) => {
      if (context?.tempId) {
        const prev = queryClient.getQueryData<Database['public']['Tables']['conversations']['Row'][]>(['conversations', variables.user_id]) || []
        queryClient.setQueryData(
          ['conversations', variables.user_id],
          [data, ...prev.filter(c => c.id !== context.tempId)]
        )
      }
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.user_id] })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
} 