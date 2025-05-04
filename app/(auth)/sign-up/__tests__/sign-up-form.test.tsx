/* eslint-disable no-restricted-syntax, @typescript-eslint/no-var-requires */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, beforeEach, expect } from 'vitest'

let signUp: ReturnType<typeof vi.fn>, getUser: ReturnType<typeof vi.fn>, insert: ReturnType<typeof vi.fn>
let mockCreateClientImpl: () => object = () => ({
  auth: {
    signUp,
    getUser,
  },
  from: () => ({ insert }),
})

vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: (): object => mockCreateClientImpl(),
}))

describe('SignUpForm', () => {
  beforeEach(() => {
    signUp = vi.fn().mockResolvedValue({ error: null })
    getUser = vi.fn().mockResolvedValue({ data: { user: { id: '123' } } })
    insert = vi.fn().mockResolvedValue({ error: null })
    mockCreateClientImpl = () => ({
      auth: {
        signUp,
        getUser,
      },
      from: () => ({ insert }),
    })
    vi.clearAllMocks()
  })

  it('renders sign up form', async () => {
    const { SignUpForm } = await import('@/components/auth/sign-up-form')
    render(<SignUpForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    const { SignUpForm } = await import('@/components/auth/sign-up-form')
    render(<SignUpForm />)
    const signUpButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(signUpButton)
    await waitFor(() => {
      expect(screen.getByText(/full name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('handles successful sign up', async () => {
    signUp.mockResolvedValue({ error: null })
    getUser.mockResolvedValue({ data: { user: { id: '123' } } })
    insert.mockResolvedValue({ error: null })
    mockCreateClientImpl = () => ({
      auth: { signUp, getUser },
      from: () => ({ insert }),
    })
    const { SignUpForm } = await import('@/components/auth/sign-up-form')
    const user = userEvent.setup()
    render(<SignUpForm />)
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    const signUpButton = screen.getByRole('button', { name: /create account/i })
    await user.click(signUpButton)
    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'John Doe',
          },
        },
      })
      expect(insert).toHaveBeenCalled()
    })
  })

  it('handles sign up error', async () => {
    signUp.mockResolvedValue({ error: new Error('Email already exists') })
    mockCreateClientImpl = () => ({
      auth: { signUp },
      from: () => ({ insert }),
    })
    const { SignUpForm } = await import('@/components/auth/sign-up-form')
    const user = userEvent.setup()
    render(<SignUpForm />)
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    const signUpButton = screen.getByRole('button', { name: /create account/i })
    await user.click(signUpButton)
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })
}) 