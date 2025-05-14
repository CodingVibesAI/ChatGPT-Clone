import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { nanoid } from 'nanoid'

export function useCreateMessage(options?: UseMutationOptions<
  Database['public']['Tables']['messages']['Row'],
  unknown,
  {
    conversation_id: string
    content: string
    role: string
  },
  { previous: Database['public']['Tables']['messages']['Row'][] }
>) {
  const queryClient = useQueryClient()
  return useMutation<
    Database['public']['Tables']['messages']['Row'],
    unknown,
    { conversation_id: string; content: string; role: string },
    { previous: Database['public']['Tables']['messages']['Row'][] }
  >({
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
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['messages', input.conversation_id] })
      const previous = queryClient.getQueryData<Database['public']['Tables']['messages']['Row'][]>(['messages', input.conversation_id]) || []
      const optimistic: Database['public']['Tables']['messages']['Row'] = {
        id: `temp-${nanoid()}`,
        conversation_id: input.conversation_id,
        content: input.content,
        role: input.role,
        created_at: new Date().toISOString(),
        tokens_used: null,
      }
      queryClient.setQueryData([
        'messages',
        input.conversation_id
      ], [...previous, optimistic])
      return { previous }
    },
    onError: (_err, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['messages', input.conversation_id], context.previous)
      }
    },
    onSuccess: (data, variables, context) => {
      // Replace the optimistic message with the real one
      const prev = queryClient.getQueryData<Database['public']['Tables']['messages']['Row'][]>(['messages', variables.conversation_id]) || []
      queryClient.setQueryData(
        ['messages', variables.conversation_id],
        [...prev.filter(m => !m.id?.toString().startsWith('temp-')), data]
      )
      options?.onSuccess?.(data, variables, context)
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversation_id] })
    },
    ...options,
  })
} 

export async function updateMessage(id: string, content: string) {
  const { error } = await supabase
    .from('messages')
    .update({ content })
    .eq('id', id)
  if (error) throw error
} 