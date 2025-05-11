import Together from "together-ai";

const together = new Together();

export async function POST(request: Request) {
  const { messages, model = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", attachments } = await request.json();

  let finalMessages = messages;
  if (attachments && attachments.length > 0) {
    finalMessages = [
      { role: 'system', content: `The user has attached the following image(s):\n${attachments.join('\n')}` },
      ...messages,
    ];
  }

  const res = await together.chat.completions.create({
    model,
    messages: finalMessages,
    stream: true,
  });

  return new Response(res.toReadableStream());
} 