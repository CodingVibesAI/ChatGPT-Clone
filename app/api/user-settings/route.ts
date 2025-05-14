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
    .select('together_api_key, daily_query_count, last_query_reset')
    .eq('id', user.id)
    .single()
  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 })
  return NextResponse.json({
    hasTogetherApiKey: !!data?.together_api_key,
    dailyQueryCount: data?.daily_query_count,
    lastQueryReset: data?.last_query_reset,
  })
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

export async function PATCH(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { model } = body
  if (!model) return NextResponse.json({ error: 'Model required' }, { status: 400 })
  const today = new Date().toISOString().slice(0, 10)
  // Atomic update: reset if needed, then decrement if premium
  const { data, error: userError } = await supabase
    .from('users')
    .select('daily_query_count, last_query_reset')
    .eq('id', user.id)
    .single()
  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 })
  let { daily_query_count, last_query_reset } = data ?? {}
  if (last_query_reset !== today) {
    daily_query_count = 50
    last_query_reset = today
  }
  // Only decrement for premium models
  if (!/free/i.test(model)) {
    if (daily_query_count <= 0) {
      return NextResponse.json({ error: 'Query limit reached' }, { status: 403 })
    }
    daily_query_count--
  }
  // Single update
  const { error: updateError } = await supabase
    .from('users')
    .update({ daily_query_count, last_query_reset })
    .eq('id', user.id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json({ dailyQueryCount: daily_query_count })
} 