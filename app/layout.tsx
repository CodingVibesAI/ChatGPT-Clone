import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import QueryClientProviderWrapper from '@/components/providers/query-client-provider'
import SessionProvider from '@/components/providers/session-provider'
import { ToastProvider } from '@/components/providers/toast-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatGPT Clone',
  description: 'A ChatGPT clone built with Next.js and Supabase',
}

// PHASE 5: Together.AI model selection and chat integration in progress

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
            <ToastProvider />
            {children}
          </QueryClientProviderWrapper>
        </SessionProvider>
      </body>
    </html>
  )
}
