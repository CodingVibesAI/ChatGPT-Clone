import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import QueryClientProviderWrapper from '@/components/providers/query-client-provider'
import SessionProvider from '@/components/providers/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatGPT Clone',
  description: 'A ChatGPT clone built with Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <QueryClientProviderWrapper>
            {children}
          </QueryClientProviderWrapper>
        </SessionProvider>
      </body>
    </html>
  )
}
