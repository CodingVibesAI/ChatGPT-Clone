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
    <div className={inter.className + ' min-h-screen flex items-center justify-center bg-[#18181b] text-[#ececf1]'}>
      <div className="w-full max-w-[400px] mx-auto p-4 space-y-4">
        {children}
      </div>
    </div>
  )
} 