import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from '../sign-up-form'
import { createClient } from '@/lib/supabase/client'

// Mock the createClient module
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

describe('SignUpForm', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Set up the mock implementation for createClient
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
      },
      from: () => ({
        insert: jest.fn().mockResolvedValue({ error: null }),
      }),
    })
  })

  it('renders sign up form', () => {
    render(<SignUpForm />)
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
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
    const user = userEvent.setup()
    render(<SignUpForm />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    
    const signUpButton = screen.getByRole('button', { name: /create account/i })
    await user.click(signUpButton)
    
    await waitFor(() => {
      expect(createClient().auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'John Doe',
          },
        },
      })
    })
  })

  it('handles sign up error', async () => {
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({
          error: new Error('Email already exists'),
        }),
      },
    })

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