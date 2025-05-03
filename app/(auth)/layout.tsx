import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import '../globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/')
  }

  return (
    <html lang="en" className="dark">
      <body className={inter.className + ' min-h-screen flex items-center justify-center bg-background dark:bg-[#18181b] dark:text-[#ececf1]'}>
        <div className="w-full max-w-[400px] mx-auto p-4 space-y-4">
          {children}
        </div>
      </body>
    </html>
  )
} 