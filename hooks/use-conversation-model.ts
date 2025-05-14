// DEPRECATED: useConversationModel is no longer used. Replaced by useConversationModelStore (Zustand).
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useQueryClient, useMutation } from '@tanstack/react-query'

const LOCAL_KEY = 'conversationModels'

function getLocalMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
  } catch {
    return {}
  }
}

function setLocalMap(map: Record<string, string>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map))
}

export function useConversationModel(conversationId?: string | null, defaultModel?: string) {
  const queryClient = useQueryClient()
  const [localModel, setLocalModel] = useState<string | null>(null)

  // On conversation switch, use localStorage first, else set to defaultModel
  useEffect(() => {
    if (!conversationId) return
    const map = getLocalMap()
    if (map[conversationId]) {
      setLocalModel(map[conversationId])
    } else if (defaultModel) {
      map[conversationId] = defaultModel
      setLocalMap(map)
      setLocalModel(defaultModel)
      // Sync to Supabase in background
      supabase.from('conversations').update({ model: defaultModel }).eq('id', conversationId)
    } else {
      setLocalModel(null)
    }
  }, [conversationId, defaultModel])

  // Optimistic update on model change
  const { mutate: setModel } = useMutation({
    mutationFn: async (model: string) => {
      if (!conversationId) return
      // Update Supabase in background
      await supabase
        .from('conversations')
        .update({ model })
        .eq('id', conversationId)
      return model
    },
    onMutate: async (model: string) => {
      if (!conversationId) return
      setLocalModel(model)
      const map = getLocalMap()
      map[conversationId] = model
      setLocalMap(map)
      return { previous: map[conversationId] }
    },
    onError: (_err, model, context) => {
      if (!conversationId) return
      // Rollback local state and localStorage
      setLocalModel(context?.previous ?? null)
      const map = getLocalMap()
      if (context?.previous) {
        map[conversationId] = context.previous
      } else {
        delete map[conversationId]
      }
      setLocalMap(map)
    },
    onSuccess: () => {
      if (!conversationId) return
      queryClient.invalidateQueries({ queryKey: ['conversation-model', conversationId] })
    },
  })

  return {
    model: localModel,
    setModel,
    isLoading: false,
  }
} 