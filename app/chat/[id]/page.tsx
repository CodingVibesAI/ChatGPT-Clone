import ClientChatPage from './client-chat-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ChatGPT Clone – Conversation',
  description: 'Continue your conversation with AI in a modern, professional chat UI.'
}

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ClientChatPage id={id} />
} 