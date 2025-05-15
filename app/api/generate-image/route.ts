import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Simple in-memory rate limiter (per IP, per minute)
const rateLimitMap = new Map<string, { count: number, last: number }>()
const RATE_LIMIT = 10 // requests
const RATE_WINDOW = 60 * 1000 // 1 minute

export async function POST(req: NextRequest) {
  // Rate limiting
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

  const { prompt } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })

  // Get JWT from Authorization header
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Missing auth' }, { status: 401 })
  const jwt = authHeader.replace('Bearer ', '')

  // Use Supabase admin client to verify JWT and get user
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: { user }, error } = await supabase.auth.getUser(jwt)
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch Together API key from DB
  const { data: keyData, error: userError } = await supabase
    .from('users')
    .select('together_api_key')
    .eq('id', user.id)
    .single()
  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 })
  const apiKey = keyData?.together_api_key
  if (!apiKey) return NextResponse.json({ error: 'No Together API key set in your account.' }, { status: 400 })

  // Use Together's recommended model for now
  const model = 'black-forest-labs/FLUX.1-schnell'
  const steps = 4

  const res = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model, steps }),
  })

  let togetherData;
  let text;
  try {
    text = await res.text();
    togetherData = JSON.parse(text);
  } catch {
    // Not JSON, probably HTML error
    console.error('Together API non-JSON error:', text);
    return NextResponse.json({ error: text || 'Unknown error' }, { status: res.status });
  }

  if (!res.ok) {
    return NextResponse.json({ error: togetherData?.error?.message || togetherData?.error || text || 'Failed' }, { status: res.status });
  }
  return NextResponse.json(togetherData);
} 