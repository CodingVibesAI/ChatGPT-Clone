import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const schema = z.object({
  together_api_key: z.string().min(1).max(128).optional().or(z.literal('')),
})

export async function GET() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error: userError } = await supabase
    .from('users')
    .select('together_api_key')
    .eq('id', user.id)
    .single()
  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 })
  return NextResponse.json({ hasTogetherApiKey: !!data?.together_api_key })
}

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const { together_api_key } = parsed.data
  const { error: updateError } = await supabase
    .from('users')
    .update({ together_api_key: together_api_key || null })
    .eq('id', user.id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json({ success: true })
} 