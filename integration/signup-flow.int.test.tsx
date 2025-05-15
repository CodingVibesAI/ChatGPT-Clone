import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock next/navigation useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

// Import the sign-up form/component
import { SignUpForm } from '@/app/(auth)/sign-up/sign-up-form'

// Integration test: signup flow

vi.mock('@/lib/supabase/client', () => {
  const signUp = vi.fn(async () => ({ data: { user: { id: 'user2', email: 'newuser@example.com' } }, error: null }))
  globalThis.__signUp = signUp
  return {
    createSupabaseClient: () => ({
      auth: { signUp },
    }),
    supabase: {
      auth: { signUp },
    },
    __esModule: true,
  }
})

declare global {
  // eslint-disable-next-line no-var
  var __signUp: ReturnType<typeof vi.fn>
}

describe('Signup Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should sign up with email and password and show authenticated UI', async () => {
    render(<SignUpForm />)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitBtn = screen.getByRole('button', { name: /create account/i })
    const fullNameInput = screen.getByLabelText(/full name/i)

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'hunter2' } })
    fireEvent.change(fullNameInput, { target: { value: 'New User' } })
    fireEvent.click(submitBtn)

    await waitFor(() => expect(globalThis.__signUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'hunter2',
      options: { data: { full_name: 'New User' } },
    }))

    // Should show some authenticated UI state (e.g., success message, redirect, etc.)
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument()
  })
}) 