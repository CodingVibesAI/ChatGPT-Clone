"use client";

import { useEffect, useState } from 'react'
import { usePremiumQueryCountStore } from '@/hooks/use-premium-query-count-store'

export default function SidebarFooter() {
  const count = usePremiumQueryCountStore(s => s.count)
  const isUnlimited = typeof window !== 'undefined' && !!localStorage.getItem('together_api_key')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) return null

  return (
    <div className="flex items-center justify-center p-3 border-t border-[#2a2b32] text-xs text-[#b4bcd0] mt-auto w-full">
      {typeof count === 'number' ? (
        <span className="px-3 py-1 rounded-full bg-[#23272f] border border-[#353740] text-[#b4bcd0] text-sm font-medium" title="Premium queries available today">
          Premium queries: {isUnlimited ? 'Unlimited' : `${count}/50`}
        </span>
      ) : (
        <span className="px-3 py-1 rounded-full bg-[#23272f] border border-[#353740] text-[#b4bcd0] text-sm font-medium opacity-60 animate-pulse" title="Loading premium queries...">
          Premium queries: ...
        </span>
      )}
    </div>
  )
} 