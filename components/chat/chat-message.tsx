import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import React from 'react'

export default function ChatMessage({ role, content, highlight, searchTerm }: {
  role: 'user' | 'assistant',
  content: string,
  highlight?: boolean,
  searchTerm?: string
}) {
  // Highlight search term in content
  let displayContent: React.ReactNode = content
  if (searchTerm) {
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    displayContent = content.split(regex).map((part, i) =>
      regex.test(part)
        ? <span key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-1 py-0.5">{part}</span>
        : part
    )
  }
  if (role === 'assistant') {
    return (
      <div className={`text-[#ececf1] px-6 py-4 max-w-full font-normal leading-relaxed whitespace-pre-line text-[15px]${highlight ? ' ring-2 ring-yellow-400/60' : ''}`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
        {searchTerm ? (
          displayContent
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              ul: (props) => <ul className="list-disc pl-6" {...props} />,
              ol: (props) => <ol className="list-decimal pl-6" {...props} />,
              li: (props) => <li className="mb-1" {...props} />,
              strong: (props) => <strong className="font-semibold" {...props} />,
              code: (props) => <code className="bg-[#f7f7fa] px-1 py-0.5 rounded text-sm text-[#23272f]" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    )
  }
  return (
    <div className={`bg-[#545563] text-white rounded-2xl rounded-br-3xl px-6 py-4 max-w-full font-normal leading-relaxed whitespace-pre-line text-[15px]${highlight ? ' ring-2 ring-yellow-400/60' : ''}`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
      {displayContent}
    </div>
  )
} 