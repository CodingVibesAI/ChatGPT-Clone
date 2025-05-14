import { useEffect } from 'react'
import useSWR from 'swr'
import { usePremiumQueryCountStore } from '@/hooks/use-premium-query-count-store'

export default function SidebarFooter() {
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data: userSettings } = useSWR('/api/user-settings', fetcher, { revalidateOnFocus: false })
  const count = usePremiumQueryCountStore(s => s.count)
  const isUnlimited = usePremiumQueryCountStore(s => s.isUnlimited)
  const set = usePremiumQueryCountStore(s => s.set)
  useEffect(() => {
    if (userSettings) set(userSettings.dailyQueryCount ?? 50, !!userSettings.hasTogetherApiKey)
  }, [userSettings, set])
  return (
    <div className="flex items-center justify-center p-3 border-t border-[#2a2b32] text-xs text-[#b4bcd0] mt-auto w-full">
      <span className="px-3 py-1 rounded-full bg-[#23272f] border border-[#353740] text-[#b4bcd0] text-sm font-medium" title="Premium queries available today">
        Daily premium queries: {isUnlimited ? 'Unlimited' : `${count}/50`}
      </span>
    </div>
  )
} 