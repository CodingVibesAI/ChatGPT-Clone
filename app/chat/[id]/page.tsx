import ClientChatPage from './client-chat-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ChatGPT Clone – Conversation',
  description: 'Continue your conversation with AI in a modern, professional chat UI.'
}

export default function ChatPage({ params }: { params: { id: string } }) {
  return <ClientChatPage id={params.id} />
} 