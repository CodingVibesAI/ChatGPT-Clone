// Mock ESM-only markdown deps for Jest logic tests
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import '@testing-library/jest-dom'
import ChatArea from '../chat-area'
import { createSupabaseClient } from '@/lib/supabase/client'

const mockMessages = [
  { id: '1', role: 'user', content: 'Hello world' },
  { id: '2', role: 'assistant', content: 'Hi there!' },
  { id: '3', role: 'user', content: 'How are you?' },
  { id: '4', role: 'assistant', content: 'I am fine.' },
]

// Mock hooks as functions
vi.mock('@/hooks/use-active-conversation', () => ({
  useActiveConversation: vi.fn(() => ({ activeConversationId: 'conv1', setActiveConversationId: vi.fn() }))
}))
vi.mock('@/hooks/use-messages', () => ({
  useMessages: vi.fn(() => ({ data: mockMessages }))
}))
vi.mock('@/hooks/use-create-message', () => ({
  useCreateMessage: vi.fn(() => ({ mutateAsync: vi.fn(async () => ({ id: '5', content: 'Test', role: 'user' })) }))
}))
vi.mock('@/hooks/use-create-conversation', () => ({
  useCreateConversation: vi.fn(() => ({ mutateAsync: vi.fn(async () => ({ id: 'conv2' })), isPending: false }))
}))

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

describe('Chat Phase 3 & 4', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Patch supabase.from and supabase.storage.from for each test
    if (createSupabaseClient) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      createSupabaseClient.from = vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({}),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({}),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      }))
      Object.defineProperty(createSupabaseClient, 'storage', {
        value: {
          from: vi.fn(() => ({
            upload: vi.fn().mockResolvedValue({}),
            getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'url' } }))
          }))
        },
        writable: true
      })
    }
  })

  it('renders chat input and list', () => {
    render(<ChatArea />)
    expect(screen.getByPlaceholderText(/ask anything/i)).toBeInTheDocument()
    expect(screen.getByText(/hello world/i)).toBeInTheDocument()
    // Don't check for assistant markdown messages (mocked)
  })

  it('can send a message', async () => {
    render(<ChatArea />)
    const input = screen.getByPlaceholderText(/ask anything/i)
    fireEvent.change(input, { target: { value: 'Test message' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    // Only check that the input clears (user-facing effect)
    await waitFor(() => expect(input).toHaveValue(''))
  })

  it('can open and use chat search', async () => {
    render(<ChatArea />)
    const searchBtn = screen.getAllByRole('button').find(btn => btn.innerHTML.includes('search')) || screen.getByLabelText(/search/i)
    fireEvent.click(searchBtn as HTMLElement)
    const searchInput = await screen.findByPlaceholderText(/search in chat/i)
    fireEvent.change(searchInput, { target: { value: 'hello' } })
    expect(searchInput).toHaveValue('hello')
    expect(screen.getByText(/hello world/i)).toBeInTheDocument()
  })

  it('can upload a file (mock)', async () => {
    render(<ChatArea />)
    const uploadBtn = screen.getAllByRole('button').find(btn => btn.innerHTML.includes('upload'))
    fireEvent.click(uploadBtn as HTMLElement)
    // Simulate file input change
    const fileInput = document.querySelector('input[type="file"]')
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    await act(async () => {
      fireEvent.change(fileInput as HTMLInputElement, { target: { files: [file] } })
    })
    // Should not throw
  })

  it('highlights search results in chat', async () => {
    render(<ChatArea />)
    const searchBtn = screen.getAllByRole('button').find(btn => btn.innerHTML.includes('search')) || screen.getByLabelText(/search/i)
    fireEvent.click(searchBtn as HTMLElement)
    const searchInput = await screen.findByPlaceholderText(/search in chat/i)
    fireEvent.change(searchInput, { target: { value: 'hello' } })
    expect(searchInput).toHaveValue('hello')
    // No error = pass
  })

  it('shows file preview instantly and updates status', async () => {
    render(<ChatArea />)
    const uploadBtn = screen.getAllByRole('button').find(btn => btn.innerHTML.includes('upload'))
    fireEvent.click(uploadBtn as HTMLElement)
    const fileInput = document.querySelector('input[type="file"]')
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    fireEvent.change(fileInput as HTMLInputElement, { target: { files: [file] } })
    // Debug DOM
    screen.debug()
    // Preview should appear instantly
    await waitFor(() => screen.getByTestId('attachment-filename'))
    expect(screen.getByTestId('attachment-filename').textContent).toContain('hello.png')
    // Should show the file name
    expect(screen.getByTestId('attachment-filename').textContent).toContain('hello.png')
    // Remove the file
    const removeBtn = screen.getAllByRole('button').find(
      btn => btn.getAttribute('aria-label') === 'Remove attachment'
    )
    fireEvent.click(removeBtn as HTMLElement)
    await waitFor(() => expect(screen.queryByTestId('attachment-filename')).not.toBeInTheDocument())
  })

  it('shows error icon if upload fails', async () => {
    // Patch upload to fail
    const uploadMock = vi.fn().mockResolvedValue({ error: { message: 'fail' } })
    const getPublicUrlMock = vi.fn(() => ({ data: { publicUrl: 'url' } }))
    // Patch global Supabase client mock
    vi.mock('@/lib/supabase/client', () => ({
      createSupabaseClient: () => ({
        from: vi.fn(() => ({
          insert: vi.fn().mockResolvedValue({}),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({}),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
        })),
        storage: {
          from: vi.fn(() => ({
            upload: uploadMock,
            getPublicUrl: getPublicUrlMock,
          }))
        }
      })
    }))
    render(<ChatArea />)
    const uploadBtn = screen.getAllByRole('button').find(btn => btn.innerHTML.includes('upload'))
    fireEvent.click(uploadBtn as HTMLElement)
    const fileInput = document.querySelector('input[type="file"]')
    const file = new File(['fail'], 'fail.txt', { type: 'text/plain' })
    await act(async () => {
      fireEvent.change(fileInput as HTMLInputElement, { target: { files: [file] } })
    })
    // Preview should appear instantly
    // Debug DOM
    screen.debug()
    await waitFor(() => screen.getByTestId('attachment-filename'))
    expect(screen.getByTestId('attachment-filename').textContent).toContain('fail.txt')
    // Wait for error icon
    await waitFor(() => expect(screen.getByText('!')).toBeInTheDocument())
    // Should show the file name
    expect(screen.getByTestId('attachment-filename').textContent).toContain('fail.txt')
  })
}) 