import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useUpdateConversation(options?: UseMutationOptions<
  void,
  unknown,
  { id: string; user_id: string; title: string },
  { previous: { id: string; user_id: string; title: string }[] }
>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; user_id: string; title: string }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['conversations', variables.user_id] })
      const previous = queryClient.getQueryData<{ id: string; user_id: string; title: string }[]>(['conversations', variables.user_id]) || []
      queryClient.setQueryData(
        ['conversations', variables.user_id],
        previous.map(c => c.id === variables.id ? { ...c, title: variables.title } : c)
      )
      return { previous }
    },
    onError: (_err, variables, context?: { previous: { id: string; user_id: string; title: string }[] }) => {
      if (context?.previous) {
        queryClient.setQueryData(['conversations', variables.user_id], context.previous)
      }
    },
    onSuccess: (_data, variables, context?: { previous: { id: string; user_id: string; title: string }[] }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.user_id] })
      options?.onSuccess?.(_data, variables, context)
    },
    ...options,
  })
} 