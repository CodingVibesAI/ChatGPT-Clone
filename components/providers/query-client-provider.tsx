'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState, useEffect } from 'react'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

const localStoragePersister = {
  persistClient: async (client: unknown) => {
    localStorage.setItem('tanstack-query-cache', JSON.stringify(client))
  },
  restoreClient: async () => {
    const cache = localStorage.getItem('tanstack-query-cache')
    return cache ? JSON.parse(cache) : undefined
  },
  removeClient: async () => {
    localStorage.removeItem('tanstack-query-cache')
  },
}

export default function QueryClientProviderWrapper({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    persistQueryClient({
      queryClient,
      persister: localStoragePersister,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
  }, [queryClient])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
} 