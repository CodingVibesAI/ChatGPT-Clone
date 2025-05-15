import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock next/navigation useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

// Import the sign-in form/component
import { SignInForm } from '@/app/(auth)/sign-in/sign-in-form'

// Integration test: auth flow

vi.mock('@/lib/supabase/client', () => {
  const signInWithPassword = vi.fn(async () => ({ data: { user: { id: 'user1', email: 'test@example.com' } }, error: null }))
  // Attach to global for test access
  globalThis.__signInWithPassword = signInWithPassword
  return {
    createSupabaseClient: () => ({
      auth: { signInWithPassword },
    }),
    supabase: {
      auth: { signInWithPassword },
    },
    __esModule: true,
  }
})

declare global {
  // eslint-disable-next-line no-var
  var __signInWithPassword: ReturnType<typeof vi.fn>
}

describe('Auth Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should sign in with email and password and show authenticated UI', async () => {
    render(<SignInForm />)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitBtn = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'hunter2' } })
    fireEvent.click(submitBtn)

    await waitFor(() => expect(globalThis.__signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'hunter2',
    }))

    // Should show some authenticated UI state (e.g., success message, redirect, etc.)
    // Adjust this assertion to match your actual UI
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument()
  })
}) 