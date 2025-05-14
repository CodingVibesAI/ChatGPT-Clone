import Together from "together-ai";
import type { CompletionCreateParams } from "together-ai/resources/chat/completions";

const together = new Together();

type Message = CompletionCreateParams.Message;

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
  try {
    const { messages, model = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", attachments } = await request.json();

    let finalMessages: Message[] = messages;
    if (attachments && attachments.length > 0) {
      finalMessages = [
        { role: 'system', content: `The user has attached the following image(s):\n${attachments.join('\n')}` },
        ...messages,
      ];
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