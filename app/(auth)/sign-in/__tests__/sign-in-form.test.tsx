/* eslint-disable no-restricted-syntax, @typescript-eslint/no-var-requires */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, beforeEach, expect } from 'vitest'

let signIn: ReturnType<typeof vi.fn>, getUser: ReturnType<typeof vi.fn>
let mockCreateClientImpl: () => object = () => ({
  auth: {
    signInWithPassword: signIn,
    getUser,
  },
})

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => signIn(...args),
      getUser: (...args: unknown[]) => getUser(...args),
    },
    from: () => ({ insert: vi.fn() }),
  },
  createSupabaseClient: (): object => mockCreateClientImpl(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() })
}))

describe('SignInForm', () => {
  beforeEach(() => {
    signIn = vi.fn().mockResolvedValue({ error: null })
    getUser = vi.fn().mockResolvedValue({ data: { user: { id: '123' } } })
    mockCreateClientImpl = () => ({
      auth: {
        signInWithPassword: signIn,
        getUser,
      },
    })
    vi.clearAllMocks()
  })

  it('renders sign in form', async () => {
    const { SignInForm } = await import('../sign-in-form')
    render(<SignInForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    const { SignInForm } = await import('../sign-in-form')
    render(<SignInForm />)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('handles successful sign in', async () => {
    signIn.mockResolvedValue({ error: null })
    getUser.mockResolvedValue({ data: { user: { id: '123' } } })
    mockCreateClientImpl = () => ({
      auth: { signInWithPassword: signIn, getUser },
    })
    const { SignInForm } = await import('../sign-in-form')
    const user = userEvent.setup()
    render(<SignInForm />)
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('handles sign in error', async () => {
    signIn.mockResolvedValue({ error: new Error('Invalid credentials') })
    mockCreateClientImpl = () => ({
      auth: { signInWithPassword: signIn },
    })
    const { SignInForm } = await import('../sign-in-form')
    const user = userEvent.setup()
    render(<SignInForm />)
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)
    await waitFor(() => {
      expect(screen.getByText((content) => content.toLowerCase().includes('invalid credentials'))).toBeInTheDocument()
    })
  })
}) 