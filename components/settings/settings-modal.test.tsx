import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest'
import SettingsModal from './settings-modal'
import React from 'react'

// Mock createPortal to render children directly
vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

describe('SettingsModal', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    render(<SettingsModal open={false} onClose={vi.fn()} />)
    expect(screen.queryByText(/settings/i)).not.toBeInTheDocument()
  })

  it('shows loading then API key state', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ hasTogetherApiKey: true }),
      ok: true,
    })
    render(<SettingsModal open={true} onClose={vi.fn()} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/api key is set/i)).toBeInTheDocument())
  })

  it('can save API key', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ hasTogetherApiKey: false }), ok: true }) // initial
      .mockResolvedValueOnce({ json: async () => ({}), ok: true }) // save
    render(<SettingsModal open={true} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText(/no api key set/i)).toBeInTheDocument())
    fireEvent.change(screen.getByPlaceholderText(/enter together/i), { target: { value: 'sk-test' } })
    fireEvent.click(screen.getByText(/save/i))
    await waitFor(() => expect(screen.getByText(/api key saved/i)).toBeInTheDocument())
  })

  it('can remove API key', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ hasTogetherApiKey: true }), ok: true }) // initial
      .mockResolvedValueOnce({ json: async () => ({}), ok: true }) // remove
    render(<SettingsModal open={true} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText(/api key is set/i)).toBeInTheDocument())
    fireEvent.click(screen.getByText(/remove/i))
    await waitFor(() => expect(screen.getByText(/api key removed/i)).toBeInTheDocument())
  })

  it('shows error on save fail', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ hasTogetherApiKey: false }), ok: true }) // initial
      .mockResolvedValueOnce({ json: async () => ({ error: 'fail' }), ok: false }) // save
    render(<SettingsModal open={true} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText(/no api key set/i)).toBeInTheDocument())
    fireEvent.change(screen.getByPlaceholderText(/enter together/i), { target: { value: 'sk-test' } })
    fireEvent.click(screen.getByText(/save/i))
    await waitFor(() => expect(screen.getByText(/fail/i)).toBeInTheDocument())
  })

  it('calls onClose when clicking outside or close button', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ hasTogetherApiKey: false }), ok: true })
    const onClose = vi.fn()
    render(<SettingsModal open={true} onClose={onClose} />)
    await waitFor(() => expect(screen.getByText(/settings/i)).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText(/close settings/i))
    expect(onClose).toHaveBeenCalled()
  })
}) 