import { useState } from 'react'
import Sidebar from '@/components/chat/sidebar'
import Header from '@/components/layout/header'
import type { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  return (
    <div className="relative h-full w-full">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={`transition-all duration-200 ${sidebarOpen ? 'ml-[260px]' : 'ml-0'}`}>
        <Header 
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
        {children}
      </div>
    </div>
  )
} 