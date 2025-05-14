'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ email: string; full_name: string } | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let ignore = false
    async function fetchProfile() {
      setLoading(true)
      setError(null)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.replace('/sign-in')
        return
      }
      const { data, error: profileError } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', user.id)
        .single()
      if (!ignore) {
        if (profileError) setError(profileError.message)
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
  }, [router])

  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: updateError } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', user?.id || '')
    if (updateError) setError(updateError.message)
    else setSuccess('Profile updated!')
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/sign-in')
  }

  const handleDelete = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    // You should use a secure API route for this in production
    const { error: deleteError } = await supabase.from('users').delete().eq('id', user?.id || '')
    if (deleteError) setError(deleteError.message)
    else {
      await supabase.auth.signOut()
      router.replace('/sign-up')
    }
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center items-center h-64 text-muted-foreground">Loading...</div>

  return (
    <div className="max-w-lg mx-auto mt-12 bg-card rounded-xl shadow-2xl p-8 text-card-foreground">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="mb-4">
        <label className="block text-muted-foreground mb-1">Email</label>
        <input
          type="email"
          value={profile?.email || ''}
          disabled
          className="w-full bg-input border border-border rounded px-3 py-2 text-foreground opacity-60 cursor-not-allowed"
        />
      </div>
      <div className="mb-6">
        <label className="block text-muted-foreground mb-1">Full Name</label>
        <input
          type="text"
          value={fullName || ''}
          onChange={e => setFullName(e.target.value)}
          className="w-full bg-input border border-border rounded px-3 py-2 text-foreground"
          name="full_name"
          autoComplete="off"
        />
        <button
          onClick={handleSave}
          className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded"
          disabled={loading || !fullName.trim()}
        >
          Save
        </button>
      </div>
      <div className="flex gap-2 mt-6">
        <button
          onClick={handleLogout}
          className="bg-muted text-foreground font-semibold px-4 py-2 rounded border border-border"
        >
          Log out
        </button>
        <button
          onClick={handleDelete}
          className="bg-destructive hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
        >
          Delete Account
        </button>
      </div>
      {error && <div className="text-destructive text-sm mt-4">{error}</div>}
      {success && <div className="text-green-500 text-sm mt-4">{success}</div>}
    </div>
  )
} 