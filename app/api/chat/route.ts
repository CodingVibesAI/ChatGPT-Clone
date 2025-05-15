import Together from "together-ai";
import type { CompletionCreateParams } from "together-ai/resources/chat/completions";

const together = new Together();

type Message = CompletionCreateParams.Message;

// Simple in-memory rate limiter (per IP, per minute)
const rateLimitMap = new Map<string, { count: number, last: number }>()
const RATE_LIMIT = 30 // requests
const RATE_WINDOW = 60 * 1000 // 1 minute

async function createChatCompletionWithFallback({ model, messages }: { model: string, messages: Message[] }) {
  try {
    return await together.chat.completions.create({
      model,
      messages,
      stream: true,
    })
  } catch {
    // Always fallback on any error
    const systemMessage = messages.find((m) => m.role === 'system')
    const chatHistory = messages
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${typeof m.content === 'string' ? m.content : ''}`)
      .join('\n')
    const prompt = systemMessage
      ? `${typeof systemMessage.content === 'string' ? systemMessage.content : ''}\n\n${chatHistory}\nAssistant:`
      : `${chatHistory}\nAssistant:`
    return await together.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })
  }
}

export async function POST(request: Request) {
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

  try {
    const { messages, model = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", attachments } = await request.json();

    let finalMessages: Message[] = messages;
    if (attachments && attachments.length > 0) {
      // Find last user message
      const lastUserIdx = messages.map((m: Message) => m.role).lastIndexOf('user');
      if (lastUserIdx !== -1) {
        const userMsg = messages[lastUserIdx];
        let contentArr: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
        if (typeof userMsg.content === 'string') {
          contentArr.push({ type: 'text', text: userMsg.content });
        } else if (Array.isArray(userMsg.content)) {
          contentArr = userMsg.content as Array<{ type: string; text?: string; image_url?: { url: string } }>;
        }
        for (const url of attachments) {
          contentArr.push({ type: 'image_url', image_url: { url } });
        }
        messages[lastUserIdx] = { ...userMsg, content: contentArr };
      }
      finalMessages = messages;
    }

    const res = await createChatCompletionWithFallback({ model, messages: finalMessages });

    return new Response(res.toReadableStream());
  } catch (err) {
    console.error('LLM API error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to contact LLM API', detail: (err as Error)?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 