let cachedModels: { name: string; description: string; price_per_million: number | null }[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 60 minutes

// Simple in-memory rate limiter (per IP, per minute)
const rateLimitMap = new Map<string, { count: number, last: number }>()
const RATE_LIMIT = 30 // requests
const RATE_WINDOW = 60 * 1000 // 1 minute

export async function GET(request: Request) {
  const apiKey = process.env.TOGETHER_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing Together.AI API key' }), { status: 500 });
  }

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const entry = rateLimitMap.get(ip) || { count: 0, last: now }
  if (now - entry.last > RATE_WINDOW) {
    entry.count = 0
    entry.last = now
  }
  entry.count++
  rateLimitMap.set(ip, entry)
  if (entry.count > RATE_LIMIT) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } })
  }

  if (cachedModels && now - cacheTimestamp < CACHE_TTL) {
    return Response.json(cachedModels);
  }

  try {
    const res = await fetch('https://api.together.xyz/v1/models', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Together API error:', res.status, text);
      return new Response(JSON.stringify({ error: 'Failed to fetch models', status: res.status, details: text }), { status: 500 });
    }

    const data = await res.json();
    const modelsArray = Array.isArray(data)
      ? data
      : Array.isArray(data.models)
        ? data.models
        : null;

    if (!modelsArray) {
      console.error('Malformed response from Together.AI:', data);
      return new Response(JSON.stringify({ error: 'Malformed response from Together.AI', details: data }), { status: 500 });
    }

    type TogetherModel = {
      id: string;
      display_name?: string;
      pricing?: { input?: number; output?: number };
    };
    function isModel(obj: unknown): obj is TogetherModel {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof (obj as { id?: unknown }).id === 'string'
      );
    }

    const models = modelsArray
      .filter(isModel)
      .map((m: TogetherModel) => ({
        name: m.id,
        description: m.display_name || '',
        price_per_million: m.pricing?.input ?? null,
      }));

    cachedModels = models;
    cacheTimestamp = now;

    return Response.json(models);
  } catch (err) {
    console.error('Fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch models', details: String(err) }), { status: 500 });
  }
} 