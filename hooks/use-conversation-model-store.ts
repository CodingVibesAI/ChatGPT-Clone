import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

const LOCAL_KEY = 'conversationModels';

function getLocalMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function setLocalMap(map: Record<string, string>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
}

interface ConversationModelState {
  selectedModels: Record<string, string>
  isHydrated: Record<string, boolean>
  setModel: (conversationId: string, model: string) => void
  getModel: (conversationId: string) => string | undefined
  hydrateModel: (conversationId: string, fallbackModel: string) => void
}

async function syncModelToSupabase(conversationId: string, model: string) {
  if (!conversationId || conversationId.startsWith('temp-')) return
  supabase.from('conversations').update({ model }).eq('id', conversationId)
}

async function fetchModelFromSupabase(conversationId: string): Promise<string | null> {
  if (!conversationId || conversationId.startsWith('temp-')) return null
  const { data, error } = await supabase
    .from('conversations')
    .select('model')
    .eq('id', conversationId)
    .single()
  if (error || !data) return null
  return data.model || null
}

export const useConversationModelStore = create<ConversationModelState>((set, get) => ({
  selectedModels: {},
  isHydrated: {},
  setModel: (conversationId, model) => {
    set(state => ({
      selectedModels: { ...state.selectedModels, [conversationId]: model },
    }))
    // Update localStorage immediately
    const map = getLocalMap();
    map[conversationId] = model;
    setLocalMap(map);
    // Persist to Supabase in background
    syncModelToSupabase(conversationId, model)
  },
  getModel: (conversationId) => get().selectedModels[conversationId],
  hydrateModel: (conversationId, fallbackModel) => {
    if (get().isHydrated[conversationId]) return
    // Check localStorage first
    const map = getLocalMap();
    const localModel = map[conversationId];
    if (localModel) {
      set(state => ({
        selectedModels: { ...state.selectedModels, [conversationId]: localModel },
        isHydrated: { ...state.isHydrated, [conversationId]: true },
      }))
      // Optionally, still fetch from Supabase in the background to sync
      fetchModelFromSupabase(conversationId).then((model) => {
        if (model && model !== localModel) {
          set(state => ({
            selectedModels: { ...state.selectedModels, [conversationId]: model },
          }))
        }
      })
      return
    }
    // Fallback to Supabase
    fetchModelFromSupabase(conversationId).then((model) => {
      set(state => ({
        selectedModels: {
          ...state.selectedModels,
          [conversationId]: model || fallbackModel,
        },
        isHydrated: { ...state.isHydrated, [conversationId]: true },
      }))
    })
  },
})) 