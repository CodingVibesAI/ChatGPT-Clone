import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase/client'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  children?: ReactNode
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [hasKey, setHasKey] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSuccess(null)
    setApiKey('')
    setIsLoading(true)
    fetch('/api/user-settings')
      .then(res => res.json())
      .then(data => {
        setHasKey(!!data.hasTogetherApiKey)
        setIsLoading(false)
      })
      .catch(() => {
        setError('Failed to load settings')
        setIsLoading(false)
      })
  }, [open])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const jwt = session?.access_token
      const res = await fetch('/api/user-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({ together_api_key: apiKey.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setApiKey('')
      setSuccess('API key saved')
      setHasKey(true)
    } catch (err: unknown) {
      setError(err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string' ? (err as { message: string }).message : 'Failed to save')
    }
    setIsSaving(false)
  }

  const handleRemove = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const jwt = session?.access_token
      const res = await fetch('/api/user-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({ together_api_key: '' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove')
      setSuccess('API key removed')
      setHasKey(false)
    } catch (err: unknown) {
      setError(err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string' ? (err as { message: string }).message : 'Failed to remove')
    }
    setIsSaving(false)
  }

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#23272f] rounded-xl shadow-2xl p-8 min-w-[340px] max-w-full relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-[#b4bcd0] hover:text-[#ececf1] text-xl font-bold"
          onClick={onClose}
          aria-label="Close settings"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#ececf1]">Settings</h2>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-[#ececf1]">Together.AI API Key</h3>
          {isLoading ? (
            <div className="text-[#b4bcd0]">Loading...</div>
          ) : (
            <>
              <div className="mb-2 text-sm text-[#b4bcd0]">
                {isLoading ? 'Loading...' : hasKey === null ? '—' : hasKey ? 'API key is set.' : 'No API key set.'}
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-2">
                <input
                  type="password"
                  className="bg-[#181a20] border border-[#353740] rounded px-3 py-2 text-[#ececf1] focus:border-[#ececf1] outline-none"
                  placeholder="Enter Together.AI API key"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  autoComplete="off"
                  disabled={isSaving}
                />
                <div className="flex gap-2 mt-1">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1.5 rounded disabled:opacity-60"
                    disabled={isSaving || !apiKey.trim()}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  {hasKey && (
                    <button
                      type="button"
                      className="bg-[#353740] hover:bg-[#23272f] text-[#ececf1] font-semibold px-4 py-1.5 rounded border border-[#353740] disabled:opacity-60"
                      onClick={handleRemove}
                      disabled={isSaving}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
                {success && <div className="text-green-400 text-sm mt-1">{success}</div>}
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
} 