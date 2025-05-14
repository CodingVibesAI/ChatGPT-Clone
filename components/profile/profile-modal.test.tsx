import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import ProfileModal from './profile-modal'
import React from 'react'

vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

const mockGetUser = vi.fn()
const mockFrom = vi.fn(() => ({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(), update: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis() }))
const mockSignOut = vi.fn()
const mockReplace = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: { getUser: mockGetUser, signOut: mockSignOut },
    from: mockFrom,
  },
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mockReplace }) }))

describe('ProfileModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    render(<ProfileModal open={false} onClose={vi.fn()} />)
    expect(screen.queryByText(/profile/i)).not.toBeInTheDocument()
  })

  it('fetches and displays profile', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    mockFrom().select().eq().single.mockResolvedValueOnce({ data: { email: 'a@b.com', full_name: 'Test' }, error: null })
    render(<ProfileModal open={true} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByDisplayValue('a@b.com')).toBeInTheDocument())
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
  })

  it('can save profile', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    mockFrom().select().eq().single.mockResolvedValue({ data: { email: 'a@b.com', full_name: 'Test' }, error: null })
    mockFrom().update().eq.mockResolvedValue({ error: null })
    render(<ProfileModal open={true} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByDisplayValue('Test')).toBeInTheDocument())
    fireEvent.change(screen.getByDisplayValue('Test'), { target: { value: 'New Name' } })
    fireEvent.click(screen.getByText('Save'))
    await waitFor(() => expect(screen.getByText(/profile updated/i)).toBeInTheDocument())
  })

  it('can logout', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    mockFrom().select().eq().single.mockResolvedValue({ data: { email: 'a@b.com', full_name: 'Test' }, error: null })
    render(<ProfileModal open={true} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('Log out')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Log out'))
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled())
    expect(mockReplace).toHaveBeenCalledWith('/sign-in')
  })

  it('shows and cancels delete confirmation', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    mockFrom().select().eq().single.mockResolvedValue({ data: { email: 'a@b.com', full_name: 'Test' }, error: null })
    render(<ProfileModal open={true} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('Delete Account')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Delete Account'))
    expect(screen.getByText(/irreversible/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText(/irreversible/i)).not.toBeInTheDocument()
  })

  it('confirms and deletes account', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    mockFrom().select().eq().single.mockResolvedValue({ data: { email: 'a@b.com', full_name: 'Test' }, error: null })
    mockFrom().delete().eq.mockResolvedValue({ error: null })
    render(<ProfileModal open={true} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('Delete Account')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Delete Account'))
    fireEvent.click(screen.getByText(/yes, delete/i))
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled())
    expect(mockReplace).toHaveBeenCalledWith('/sign-up')
  })

  it('shows error on profile fetch fail', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    mockFrom().select().eq().single.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })
    render(<ProfileModal open={true} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('fail')).toBeInTheDocument())
  })

  it('calls onClose when clicking outside or close button', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    mockFrom().select().eq().single.mockResolvedValueOnce({ data: { email: 'a@b.com', full_name: 'Test' }, error: null })
    const onClose = vi.fn()
    render(<ProfileModal open={true} onClose={onClose} />)
    await waitFor(() => expect(screen.getByText(/profile/i)).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText(/close profile/i))
    expect(onClose).toHaveBeenCalled()
  })
}) 