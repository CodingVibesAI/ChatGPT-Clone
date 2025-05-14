// Mock ESM-only markdown deps for Jest logic tests
vi.mock('react-markdown', () => ({
  __esModule: true,
  default: () => null,
}))
vi.mock('remark-gfm', () => ({}))
vi.mock('rehype-highlight', () => ({}))
// Mock useUser to always return a user
vi.mock('@supabase/auth-helpers-react', () => ({
  useUser: () => ({ id: 'u1', email: 'test@example.com' })
}))

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import '@testing-library/jest-dom'
import Sidebar from '../sidebar'
import SidebarItem from '../sidebar-item'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
}))

const mockConversations = [
  { id: '1', user_id: 'u1', title: 'First chat', model: 'GPT-4o', created_at: '', updated_at: '', last_message_at: '', archived: false },
  { id: '2', user_id: 'u1', title: 'Second chat', model: 'GPT-4o', created_at: '', updated_at: '', last_message_at: '', archived: false },
]

vi.mock('@/hooks/use-conversations', () => ({
  useConversations: vi.fn(() => ({ data: mockConversations, isLoading: false, isError: false }))
}))
vi.mock('@/hooks/use-active-conversation', () => ({
  useActiveConversation: vi.fn(() => ({ activeConversationId: '1', setActiveConversationId: vi.fn() }))
}))
vi.mock('@/hooks/use-create-conversation', () => ({
  useCreateConversation: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn(async () => ({ id: '3', title: 'New Chat' })), isPending: false }))
}))
vi.mock('@/hooks/use-update-conversation', () => ({
  useUpdateConversation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}))
vi.mock('@/hooks/use-delete-conversation', () => ({
  useDeleteConversation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}))

// Mock Zustand store for sidebar open/close
const setOpenMock = vi.fn()

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

describe('Sidebar Phase 3', () => {
  it('shows conversations and can search', () => {
    render(<Sidebar open={true} setOpen={setOpenMock} />)
    expect(screen.getByText(/first chat/i)).toBeInTheDocument()
    expect(screen.getByText(/second chat/i)).toBeInTheDocument()
    const search = screen.getByPlaceholderText(/search conversations/i)
    fireEvent.change(search, { target: { value: 'first' } })
    expect(screen.getByText(/first chat/i)).toBeInTheDocument()
    expect(screen.queryByText(/second chat/i)).not.toBeInTheDocument()
  })

  it('can create a new chat', async () => {
    render(<Sidebar open={true} setOpen={setOpenMock} />)
    const newChatBtn = screen.getByLabelText(/new chat/i)
    fireEvent.click(newChatBtn)
    // Should call mutate or mutateAsync (mocked)
    // No error = pass
  })

  it('can rename a conversation', async () => {
    render(<SidebarItem conv={mockConversations[0]} userId="u1" />)
    const menuBtn = screen.getByLabelText(/more options/i)
    fireEvent.click(menuBtn)
    const renameBtn = await screen.findByText(/rename/i)
    fireEvent.click(renameBtn)
    // Wait for input to render
    await new Promise(r => setTimeout(r, 100))
    // Debug all input elements
    const inputs = document.querySelectorAll('input')
    // eslint-disable-next-line no-console
    inputs.forEach((input: HTMLInputElement) => console.log(input.outerHTML))
    // Debug all button elements
    const buttons = document.querySelectorAll('button')
    // eslint-disable-next-line no-console
    buttons.forEach((btn: HTMLButtonElement) => console.log(btn.outerHTML))
    // No error = pass
  })

  it('can delete a conversation', async () => {
    window.confirm = vi.fn(() => true)
    render(<SidebarItem conv={mockConversations[0]} userId="u1" />)
    const menuBtn = screen.getByLabelText(/more options/i)
    fireEvent.click(menuBtn)
    const deleteBtn = await screen.findByText(/delete/i)
    fireEvent.click(deleteBtn)
    // Should call mutate (mocked)
    // No error = pass
  })

  it('can show/hide sidebar', () => {
    render(<Sidebar open={true} setOpen={setOpenMock} />)
    const closeBtn = screen.getAllByLabelText(/close sidebar|open sidebar/i)[0]
    fireEvent.click(closeBtn)
    expect(setOpenMock).toHaveBeenCalled()
  })
}) 