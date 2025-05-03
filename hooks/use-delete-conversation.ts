import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useDeleteConversation(options?: UseMutationOptions<
  void,
  unknown,
  { id: string; user_id: string },
  { previous: { id: string; user_id: string }[] }
>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; user_id: string }) => {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['conversations', variables.user_id] })
      const previous = queryClient.getQueryData<{ id: string; user_id: string }[]>(['conversations', variables.user_id]) || []
      queryClient.setQueryData(
        ['conversations', variables.user_id],
        previous.filter(c => c.id !== variables.id)
      )
      return { previous }
    },
    onError: (_err, variables, context?: { previous: { id: string; user_id: string }[] }) => {
      if (context?.previous) {
        queryClient.setQueryData(['conversations', variables.user_id], context.previous)
      }
    },
    onSuccess: (_data, variables, context?: { previous: { id: string; user_id: string }[] }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.user_id] })
      options?.onSuccess?.(_data, variables, context)
    },
    ...options,
  })
} 