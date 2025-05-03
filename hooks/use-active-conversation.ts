import { create } from 'zustand'

interface ActiveConversationState {
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
}

export const useActiveConversation = create<ActiveConversationState>((set) => ({
  activeConversationId: null,
  setActiveConversationId: (id: string | null) => set({ activeConversationId: id }),
})) 