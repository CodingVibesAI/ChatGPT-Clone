import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import React from 'react'

export default function ChatMessage({ role, content, highlight, searchTerm }: {
  role: 'user' | 'assistant',
  content: React.ReactNode,
  highlight?: boolean,
  searchTerm?: string
}) {
  // Highlight search term in content
  let displayContent: React.ReactNode = content
  if (searchTerm && typeof content === 'string') {
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi')
    displayContent = content.split(regex).map((part: string, i: number) =>
      regex.test(part)
        ? <span key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-1 py-0.5">{part}</span>
        : part
    )
  }

  function renderWithThinks(content: string) {
    // Remove any stray <think> tags without a closing </think>
    content = content.replace(/<think>(?![\s\S]*?<\/think>)/g, '');
    const regex = /<think>([\s\S]*?)<\/think>/g;
    const matches = [...content.matchAll(regex)];
    // If the entire content is just a single <think>...</think>, render as normal markdown
    if (matches.length === 1 && matches[0].index === 0 && matches[0][0].length === content.length) {
      return [<ReactMarkdown key="md-only">{matches[0][1].trim()}</ReactMarkdown>];
    }
    const parts = [];
    let lastIndex = 0;
    let idx = 0;
    for (const match of matches) {
      if (match.index! > lastIndex) {
        parts.push(
          <ReactMarkdown key={`md-${idx++}`}>{content.slice(lastIndex, match.index)}</ReactMarkdown>
        );
      }
      if (match[1].trim()) {
        parts.push(
          <div
            key={`think-${idx++}`}
            className="bg-gradient-to-br from-[#23272f] to-[#353740] border-l-4 border-[#b4bcd0] text-[#b4bcd0] italic px-4 py-3 my-3 rounded-md shadow-inner relative"
            style={{ fontStyle: 'italic', opacity: 0.92 }}
          >
            <span className="block text-xs uppercase tracking-wider mb-1 text-[#8e8ea0]">AI is thinking...</span>
            <span className="whitespace-pre-line">{match[1].trim()}</span>
            <span className="absolute top-2 right-3 text-[#8e8ea0] text-lg select-none">💭</span>
          </div>
        );
      }
      lastIndex = match.index! + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push(
        <ReactMarkdown key={`md-${idx++}`}>{content.slice(lastIndex)}</ReactMarkdown>
      );
    }
    return parts;
  }

  if (role === 'assistant') {
    if (typeof content === 'string' && content.includes('<think>')) {
      return (
        <div className="text-[#ececf1] px-6 py-4 max-w-full font-normal leading-relaxed whitespace-pre-line text-[15px]">
          {renderWithThinks(content.toString())}
        </div>
      );
    }
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
            {typeof content === 'string' ? content : ''}
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