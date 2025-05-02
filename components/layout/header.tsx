import { Share2, Settings, User, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const MODELS = [
  { name: 'GPT-4o' },
  { name: 'GPT-4' },
  { name: 'GPT-3.5' },
]

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0].name)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#353740] focus:bg-[#353740] transition-colors text-[#ececf1] font-bold text-[17px]"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <span>{selectedModel}</span>
          <ChevronDown size={18} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-2 w-44 bg-[#23272f] border border-[#353740] rounded-lg shadow-lg z-50">
            <ul className="py-1" role="listbox">
              {MODELS.map((model) => (
                <li key={model.name}>
                  <button
                    className={`w-full text-left px-4 py-2 text-[#ececf1] hover:bg-[#353740] transition-colors ${selectedModel === model.name ? 'font-bold bg-[#353740]' : ''}`}
                    onClick={() => { setSelectedModel(model.name); setDropdownOpen(false); }}
                    role="option"
                    aria-selected={selectedModel === model.name}
                  >
                    {model.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-full hover:bg-[#353740] transition-colors text-[#b4bcd0]" aria-label="Share"><Share2 size={20} /></button>
        <button className="p-1.5 rounded-full hover:bg-[#353740] transition-colors text-[#b4bcd0]" aria-label="Settings"><Settings size={20} /></button>
        <button className="p-1.5 rounded-full hover:bg-[#353740] transition-colors text-[#b4bcd0]" aria-label="Profile"><User size={20} /></button>
      </div>
    </header>
  )
} 