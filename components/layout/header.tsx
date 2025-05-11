import { Share2, Settings, User, ChevronDown, Check } from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { createPortal } from 'react-dom'
import { useActiveConversation } from '@/hooks/use-active-conversation'
import { useConversationModel } from '@/hooks/use-conversation-model'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type Model = {
  name: string
  description: string
  price_per_million: number | null
}

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number; width: number } | null>(null)
  const { data: models, isLoading, error } = useSWR<Model[]>('/api/models', fetcher, { revalidateOnFocus: false })
  const [search, setSearch] = useState('')
  const debouncedSearch = useMemo(() => search, [search])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get active conversation
  const activeConversationId = useActiveConversation(s => s.activeConversationId)
  const preferredDefault = models?.find(m => /deepseek/i.test(m.name) && /free/i.test(m.name))?.name || models?.[0]?.name
  const { model: selectedModel, setModel: setSelectedModel, isLoading: isModelLoading } = useConversationModel(activeConversationId, preferredDefault)

  // Autofocus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
    if (!dropdownOpen) setSearch('')
  }, [dropdownOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({ left: rect.left, top: rect.bottom + window.scrollY, width: rect.width })
    }
  }, [dropdownOpen])

  const filteredModels = useMemo(() => {
    if (!models) return []
    let list = models
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = models.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
      )
    }
    if (selectedModel) {
      list = [...list].sort((a, b) => (a.name === selectedModel ? -1 : b.name === selectedModel ? 1 : 0));
    }
    return list
  }, [models, debouncedSearch, selectedModel])

  const dropdownMenu = dropdownOpen && dropdownPos && activeConversationId
    ? createPortal(
        <div
          ref={dropdownRef}
          className="bg-[#23272f] border border-[#353740] rounded-lg shadow-lg z-[9999] max-h-96 overflow-y-auto pointer-events-auto"
          style={{
            position: 'absolute',
            left: dropdownPos.left,
            top: dropdownPos.top,
            minWidth: dropdownPos.width,
            width: 320,
          }}
        >
          <div className="px-3 pt-3 pb-1 sticky top-0 bg-[#23272f] z-10">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search models..."
              className="w-full px-3 py-2 rounded bg-[#181a20] text-[#ececf1] text-sm outline-none border border-[#353740] focus:border-[#ececf1] transition-colors"
              autoComplete="off"
            />
          </div>
          <ul className="py-1" role="listbox">
            {isLoading && (
              <li className="px-4 py-2 text-[#ececf1] opacity-60">Loading models...</li>
            )}
            {error && (
              <li className="px-4 py-2 text-red-400">Failed to load models</li>
            )}
            {filteredModels && filteredModels.length === 0 && !isLoading && !error && (
              <li className="px-4 py-2 text-[#ececf1] opacity-60">No models found</li>
            )}
            {filteredModels && filteredModels.map((model) => (
              <li key={model.name}>
                <button
                  className={`w-full text-left px-4 py-2 text-[#ececf1] hover:bg-[#353740] transition-colors rounded flex flex-col items-start relative ${selectedModel === model.name ? 'font-bold bg-[#353740]' : ''}`}
                  onClick={() => { setSelectedModel(model.name); setDropdownOpen(false); }}
                  role="option"
                  aria-selected={selectedModel === model.name}
                  disabled={isModelLoading}
                >
                  <span className="flex items-center gap-2 text-[16px]">
                    {model.description || model.name}
                    {selectedModel === model.name && <Check size={16} className="text-green-400" />}
                  </span>
                  <span className="text-xs text-[#b4bcd0] mt-0.5">{model.name}</span>
                  {model.price_per_million !== null && (
                    <span className="text-xs text-[#7f8697] mt-0.5">${model.price_per_million.toFixed(3)} / M tokens</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )
    : null

  return (
    <header
      className="w-full flex items-center justify-between relative"
      style={{
        height: 56,
        padding: "0 16px",
        background: "transparent",
        color: "#ececf1",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: 17,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "none",
        boxShadow: "none",
      }}
    >
      <div className="flex items-center gap-2 relative">
        {activeConversationId && (
          <button
            ref={buttonRef}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#353740] focus:bg-[#353740] transition-colors text-[#ececf1] font-bold text-[17px]"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            disabled={isModelLoading}
          >
            <span>
              {models && selectedModel
                ? (models.find(m => m.name === selectedModel)?.description || selectedModel)
                : isModelLoading ? 'Loading...' : 'Select model'}
            </span>
            <ChevronDown size={18} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
        {dropdownMenu}
      </div>
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-full hover:bg-[#353740] transition-colors text-[#b4bcd0]" aria-label="Share"><Share2 size={20} /></button>
        <button className="p-1.5 rounded-full hover:bg-[#353740] transition-colors text-[#b4bcd0]" aria-label="Settings"><Settings size={20} /></button>
        <button className="p-1.5 rounded-full hover:bg-[#353740] transition-colors text-[#b4bcd0]" aria-label="Profile"><User size={20} /></button>
      </div>
    </header>
  )
} 