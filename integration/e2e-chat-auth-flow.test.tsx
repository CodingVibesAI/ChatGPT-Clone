import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock next/navigation useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

// Import forms and chat
import { SignUpForm } from '@/app/(auth)/sign-up/sign-up-form'
import { SignInForm } from '@/app/(auth)/sign-in/sign-in-form'
import ChatArea from '@/components/chat/chat-area'
import QueryClientProviderWrapper from '@/components/providers/query-client-provider'

// Supabase + chat mocks
vi.mock('@/lib/supabase/client', () => {
  const mockSignUp = vi.fn(async () => ({ data: { user: { id: 'user2', email: 'newuser@example.com' } }, error: null }))
  const mockSignIn = vi.fn(async () => ({ data: { user: { id: 'user2', email: 'newuser@example.com' } }, error: null }))
  globalThis.mockSignUp = mockSignUp
  globalThis.mockSignIn = mockSignIn
  return {
    createSupabaseClient: () => ({
      auth: { signUp: mockSignUp, signInWithPassword: mockSignIn },
      from: vi.fn(),
      storage: { from: vi.fn() },
    }),
    supabase: {
      auth: { signUp: mockSignUp, signInWithPassword: mockSignIn },
      from: vi.fn(),
      storage: { from: vi.fn() },
    },
    __esModule: true,
  }
})

declare global {
  // eslint-disable-next-line no-var
  var mockSignUp: ReturnType<typeof vi.fn>
  // eslint-disable-next-line no-var
  var mockSignIn: ReturnType<typeof vi.fn>
}

// Zustand/chat hooks
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
vi.mock('together-ai', () => ({
  chat: vi.fn(async () => ({ choices: [{ message: { content: 'AI response' } }] })),
}))

describe('E2E: Signup, Signin, Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('should sign up, sign in, and send a chat message', async () => {
    // Sign up
    render(<SignUpForm />)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'New User' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newuser@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'hunter2' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => expect(globalThis.mockSignUp).toHaveBeenCalled())
    expect(screen.queryByText(/account created/i)).not.toBeNull()

    // Sign in
    render(<SignInForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newuser@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'hunter2' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(globalThis.mockSignIn).toHaveBeenCalled())

    // Chat
    render(
      <QueryClientProviderWrapper>
        <ChatArea />
      </QueryClientProviderWrapper>
    )
    const input = screen.getByPlaceholderText(/ask anything/i)
    fireEvent.change(input, { target: { value: 'Hello integration!' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    await waitFor(() => expect(input).toHaveValue(''))
    expect(screen.getByText(/hello integration/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/ai response/i)).toBeInTheDocument())
  })
}) 