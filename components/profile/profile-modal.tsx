import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<{ email: string; full_name: string } | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    let ignore = false
    async function fetchProfile() {
      setLoading(true)
      setError(null)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error(userError?.message || 'Auth error. Please sign in again.')
        router.replace('/sign-in')
        return
      }
      const { data, error: profileError } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', user.id)
        .single()
      if (!ignore) {
        if (profileError) {
          setError(profileError.message)
          toast.error(profileError.message)
        }
        else {
          setProfile({
            email: data?.email || '',
            full_name: data?.full_name || '',
          })
          setFullName(data?.full_name || '')
        }
        setLoading(false)
      }
    }
    fetchProfile()
    return () => { ignore = true }
  }, [open, router])

  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: updateError } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', user?.id || '')
    if (updateError) {
      setError(updateError.message)
      toast.error(updateError.message)
    }
    else setSuccess('Profile updated!')
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.replace('/sign-in')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        toast.error((err as { message: string }).message)
      } else {
        toast.error('Logout failed')
      }
    }
  }

  const handleDelete = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    // You should use a secure API route for this in production
    const { error: deleteError } = await supabase.from('users').delete().eq('id', user?.id || '')
    if (deleteError) {
      setError(deleteError.message)
      toast.error(deleteError.message)
    }
    else {
      await supabase.auth.signOut()
      router.replace('/sign-up')
    }
    setLoading(false)
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-[#23272f] text-[#ececf1] rounded-2xl shadow-2xl border border-[#353740] p-8 min-w-[340px] max-w-full relative w-full max-w-lg animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#353740] transition-colors text-[#b4bcd0] hover:text-[#ececf1] text-xl"
          onClick={onClose}
          aria-label="Close profile"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L14 14M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        {loading ? (
          <div className="flex justify-center items-center h-32 text-[#b4bcd0]">Loading...</div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-[#b4bcd0] mb-1">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full bg-[#181a20] border border-[#353740] rounded px-3 py-2 text-[#ececf1] opacity-60 cursor-not-allowed"
              />
            </div>
            <div className="mb-6">
              <label className="block text-[#b4bcd0] mb-1">Full Name</label>
              <input
                type="text"
                value={fullName || ''}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-[#181a20] border border-[#353740] rounded px-3 py-2 text-[#ececf1]"
                name="full_name"
                autoComplete="off"
              />
              <button
                onClick={handleSave}
                className="mt-2 bg-[#19c37d] hover:bg-[#17b37c] text-white font-semibold px-4 py-2 rounded shadow-sm transition-colors"
                disabled={loading || !fullName.trim()}
              >
                Save
              </button>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleLogout}
                className="bg-[#353740] hover:bg-[#181a20] text-[#ececf1] font-semibold px-4 py-2 rounded border border-[#353740] transition-colors"
              >
                Log out
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="bg-[#ff4b4b] hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition-colors"
              >
                Delete Account
              </button>
            </div>
            {error && <div className="text-[#ff4b4b] text-sm mt-4">{error}</div>}
            {success && <div className="text-[#19c37d] text-sm mt-4">{success}</div>}
          </>
        )}
      </div>
      {confirmDelete && createPortal(
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/80">
          <div className="bg-[#23272f] text-[#ececf1] rounded-xl shadow-2xl border border-[#353740] p-6 min-w-[320px] max-w-full relative w-full max-w-sm animate-fade-in">
            <div className="text-lg font-bold mb-2">Delete Account?</div>
            <div className="mb-4 text-[#b4bcd0]">This action is <span className="text-[#ff4b4b] font-semibold">irreversible</span>. Are you sure you want to permanently delete your account?</div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="bg-[#353740] hover:bg-[#181a20] text-[#ececf1] font-semibold px-4 py-2 rounded border border-[#353740] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setConfirmDelete(false); handleDelete(); }}
                className="bg-[#ff4b4b] hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition-colors"
                autoFocus
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>,
    document.body
  )
} 