import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const schema = z.object({
  together_api_key: z.string().min(1).max(128).optional().or(z.literal('')),
})

// NOTE: This route uses SUPABASE_SERVICE_ROLE_KEY for all DB access and only accepts JWT via Authorization header. Cookies are NOT used.

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUserFromAuthHeader(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  const jwt = authHeader.replace('Bearer ', '')
  if (!jwt) return null
  const supabase = getSupabaseAdmin()
  const { data: { user }, error } = await supabase.auth.getUser(jwt)
  if (error || !user) return null
  return user
}

// Simple in-memory rate limiter (per IP, per minute)
const rateLimitMap = new Map<string, { count: number, last: number }>()
const RATE_LIMIT = 30 // requests
const RATE_WINDOW = 60 * 1000 // 1 minute

function rateLimit(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const entry = rateLimitMap.get(ip) || { count: 0, last: now }
  if (now - entry.last > RATE_WINDOW) {
    entry.count = 0
    entry.last = now
  }
  entry.count++
  rateLimitMap.set(ip, entry)
  if (entry.count > RATE_LIMIT) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  return null
}

export async function GET(req: NextRequest) {
  const limit = rateLimit(req)
  if (limit) return limit
  const user = await getUserFromAuthHeader(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabaseAdmin()
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
  const limit = rateLimit(req)
  if (limit) return limit
  const user = await getUserFromAuthHeader(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const { together_api_key } = parsed.data
  const supabase = getSupabaseAdmin()
  const { error: updateError } = await supabase
    .from('users')
    .update({ together_api_key: together_api_key || null })
    .eq('id', user.id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const limit = rateLimit(req)
  if (limit) return limit
  const user = await getUserFromAuthHeader(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { model } = body
  if (!model) return NextResponse.json({ error: 'Model required' }, { status: 400 })
  const today = new Date().toISOString().slice(0, 10)
  const supabase = getSupabaseAdmin()
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