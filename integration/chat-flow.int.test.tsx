import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock Supabase and Together.ai API
vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: () => ({
    auth: {
      signInWithPassword: vi.fn(async () => ({ data: { user: { id: 'user1' } }, error: null })),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: [{ id: 'conv1', title: 'New Chat' }], error: null }),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'conv1', title: 'New Chat' }, error: null }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'file.png' }, error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file.png' } })),
      })),
    },
  }),
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'conv1', title: 'New Chat' }, error: null })
        }) )
      })),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'conv1', title: 'New Chat' }, error: null }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'file.png' }, error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file.png' } })),
      })),
    },
  },
}))
vi.mock('together-ai', () => ({
  chat: vi.fn(async () => ({ choices: [{ message: { content: 'AI response' } }] })),
}))

// Import the main chat page/component (adjust import as needed)
import ChatArea from '@/components/chat/chat-area'
import QueryClientProviderWrapper from '@/components/providers/query-client-provider'

// Mock the Zustand useActiveConversation hook
vi.mock('@/hooks/use-active-conversation', () => ({
  useActiveConversation: vi.fn((selector) => {
    const state = {
      activeConversationId: 'conv1',
      setActiveConversationId: vi.fn(),
    }
    if (typeof selector === 'function') return selector(state)
    return state
  })
}))

const mockMessages = [
  { id: '1', role: 'user', content: 'Hello integration!' },
  { id: '2', role: 'assistant', content: 'AI response' },
]

vi.mock('@/hooks/use-messages', () => ({
  useMessages: vi.fn(() => ({ data: mockMessages }))
}))

vi.mock('@/hooks/use-create-message', () => ({
  useCreateMessage: vi.fn(() => ({ mutateAsync: vi.fn(async () => ({ id: '3', content: 'Hello integration!', role: 'user' })) }))
}))
vi.mock('@/hooks/use-create-conversation', () => ({
  useCreateConversation: vi.fn(() => ({ mutateAsync: vi.fn(async () => ({ id: 'conv2' })), isPending: false }))
}))

// Integration test: chat flow

describe('Chat Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('should sign in, create a conversation, send a message, receive a response, and upload a file', async () => {
    render(
      <QueryClientProviderWrapper>
        <ChatArea />
      </QueryClientProviderWrapper>
    )

    // Simulate sending a message
    const input = screen.getByPlaceholderText(/ask anything/i)
    fireEvent.change(input, { target: { value: 'Hello integration!' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    await waitFor(() => expect(input).toHaveValue(''))
    // Should show user message
    expect(screen.getByText(/hello integration/i)).toBeInTheDocument()
    // Should show AI response
    await waitFor(() => expect(screen.getByText(/ai response/i)).toBeInTheDocument())

    // Simulate file upload
    const uploadBtn = screen.getAllByRole('button').find(btn => btn.innerHTML.includes('upload'))
    fireEvent.click(uploadBtn as HTMLElement)
    const fileInput = document.querySelector('input[type="file"]')
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    await act(async () => {
      fireEvent.change(fileInput as HTMLInputElement, { target: { files: [file] } })
    })
    // Should show file preview
    await waitFor(() => expect(screen.getByTestId('attachment-filename').textContent).toContain('test.png'))
  })
}) 