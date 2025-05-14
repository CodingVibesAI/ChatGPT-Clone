import { create } from 'zustand'

interface PremiumQueryCountState {
  count: number | null
  isUnlimited: boolean
  set: (count: number, isUnlimited: boolean) => void
  decrement: () => void
  reset: () => void
  syncFromDb: (count: number, isUnlimited: boolean) => void
}

function persist(count: number | null, isUnlimited: boolean) {
  if (typeof window !== 'undefined') {
    if (count !== null) localStorage.setItem('premiumQueryCount', String(count))
    localStorage.setItem('isUnlimited', String(isUnlimited))
  }
}

export const usePremiumQueryCountStore = create<PremiumQueryCountState>((set, get) => {
  // Hydrate from localStorage
  let count: number | null = 50
  let isUnlimited = false
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('premiumQueryCount')
    const unlimited = localStorage.getItem('isUnlimited')
    if (stored) count = Number(stored)
    if (unlimited) isUnlimited = unlimited === 'true'
  }
  return {
    count,
    isUnlimited,
    set: (count, isUnlimited) => {
      persist(count, isUnlimited)
      set({ count, isUnlimited })
    },
    decrement: () => {
      const { count, isUnlimited } = get()
      if (!isUnlimited && count !== null) {
        const newCount = Math.max(0, count - 1)
        persist(newCount, isUnlimited)
        set({ count: newCount })
      }
    },
    reset: () => {
      persist(50, false)
      set({ count: 50, isUnlimited: false })
    },
    syncFromDb: (count, isUnlimited) => {
      persist(count, isUnlimited)
      set({ count, isUnlimited })
    },
  }
}) 