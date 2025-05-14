import { create } from 'zustand'

interface PremiumQueryCountState {
  count: number
  isUnlimited: boolean
  set: (count: number, isUnlimited: boolean) => void
  decrement: () => void
  reset: () => void
}

export const usePremiumQueryCountStore = create<PremiumQueryCountState>((set) => ({
  count: 50,
  isUnlimited: false,
  set: (count, isUnlimited) => set({ count, isUnlimited }),
  decrement: () => set((s) => s.isUnlimited ? s : { ...s, count: Math.max(0, s.count - 1) }),
  reset: () => set({ count: 50, isUnlimited: false }),
})) 