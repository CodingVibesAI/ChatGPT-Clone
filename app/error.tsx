'use client'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body className="flex flex-col items-center justify-center h-screen w-screen bg-[#181a20] text-[#ececf1]">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <pre className="text-sm text-[#b4bcd0] bg-[#23272f] rounded p-4 max-w-xl overflow-x-auto">
          {error?.message || 'Unknown error'}
        </pre>
      </body>
    </html>
  )
} 