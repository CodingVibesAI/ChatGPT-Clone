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
  description: 'A professional ChatGPT clone with a modern dark UI, built with Next.js and Supabase.',
  metadataBase: new URL('https://yourdomain.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ChatGPT Clone',
    description: 'A professional ChatGPT clone with a modern dark UI, built with Next.js and Supabase.',
    url: 'https://yourdomain.com',
    siteName: 'ChatGPT Clone',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChatGPT Clone',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatGPT Clone',
    description: 'A professional ChatGPT clone with a modern dark UI, built with Next.js and Supabase.',
    site: '@yourtwitter',
    creator: '@yourtwitter',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport = {
  themeColor: '#181a20',
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
