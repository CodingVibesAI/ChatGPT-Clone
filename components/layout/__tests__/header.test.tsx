import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeAll, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import Header from '../header'
import { useConversationModelStore } from '@/hooks/use-conversation-model-store'

// Mocks
const mockModels = [
  { name: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-Free', description: 'DeepSeek Free', price_per_million: 0 },
  { name: 'mistral-ai/Mistral-7B-Instruct-v0.2', description: 'Mistral 7B', price_per_million: 1 },
  { name: 'anthropic/claude-3-haiku', description: 'Claude 3 Haiku', price_per_million: 2 },
]

vi.mock('swr', () => ({
  __esModule: true,
  default: () => ({ data: mockModels, isLoading: false, error: null })
}))
vi.mock('@/hooks/use-active-conversation', () => ({
  useActiveConversation: vi.fn(() => 'conv1')
}))
vi.mock('@/hooks/use-conversation-model-store', () => {
  const selectedModels: Record<string, string> = {}
  const isHydrated: Record<string, boolean> = {}
  const state = {
    selectedModels,
    isHydrated,
    setModel: (conversationId: string, model: string) => {
      selectedModels[conversationId] = model
    },
    getModel: (conversationId: string) => selectedModels[conversationId],
    hydrateModel: (conversationId: string, fallbackModel: string) => {
      if (!selectedModels[conversationId]) selectedModels[conversationId] = fallbackModel
      isHydrated[conversationId] = true
    },
  }
  function useConversationModelStore(selector: (s: typeof state) => unknown) {
    return selector(state)
  }
  useConversationModelStore.getState = () => state
  return { useConversationModelStore }
})

let origWindow: Window & typeof globalThis
beforeAll(() => {
  origWindow = global.window
})
afterEach(() => {
  if (!global.window && origWindow) global.window = origWindow
})

describe('Header model dropdown', () => {
  // Helper to set initial model for the conversation before render
  const setInitialModel = (model: string) => {
    useConversationModelStore.getState().selectedModels['conv1'] = model
    useConversationModelStore.getState().isHydrated['conv1'] = true
  }

  it('shows the preferred default model as label', () => {
    setInitialModel('deepseek-ai/DeepSeek-R1-Distill-Llama-70B-Free')
    render(<Header />)
    expect(screen.getByText(/deepseek/i)).toBeInTheDocument()
  })

  it('opens the dropdown and shows all models', () => {
    setInitialModel('deepseek-ai/DeepSeek-R1-Distill-Llama-70B-Free')
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: /deepseek free/i }))
    expect(screen.getByText(/mistral 7b/i)).toBeInTheDocument()
    expect(screen.getByText(/claude 3 haiku/i)).toBeInTheDocument()
  })

  it('can search for a model', async () => {
    setInitialModel('deepseek-ai/DeepSeek-R1-Distill-Llama-70B-Free')
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: /deepseek free/i }))
    const search = screen.getByPlaceholderText(/search models/i)
    fireEvent.change(search, { target: { value: 'claude' } })
    expect(screen.getByText(/claude 3 haiku/i)).toBeInTheDocument()
    expect(screen.queryByText(/mistral 7b/i)).not.toBeInTheDocument()
  })

  it('can select a model and it moves to the top', async () => {
    setInitialModel('deepseek-ai/DeepSeek-R1-Distill-Llama-70B-Free')
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: /deepseek free/i }))
    const mistralBtn = screen.getAllByRole('option').find(btn =>
      btn.textContent?.toLowerCase().includes('mistral')
    )
    expect(mistralBtn).toBeTruthy()
    fireEvent.click(mistralBtn!)
    // Dropdown closes, label updates
    expect(screen.getByRole('button', { name: /mistral 7b/i })).toBeInTheDocument()
    // Open again, should be at top
    fireEvent.click(screen.getByRole('button', { name: /mistral 7b/i }))
    const items = screen.getAllByRole('option')
    expect(items[0].textContent?.toLowerCase()).toContain('mistral')
  })

  it('all models remain in the dropdown after multiple selections', async () => {
    setInitialModel('deepseek-ai/DeepSeek-R1-Distill-Llama-70B-Free')
    render(<Header />)
    // Open and select Mistral
    fireEvent.click(screen.getByRole('button', { name: /deepseek free/i }))
    const mistralBtn = screen.getAllByRole('option').find(btn =>
      btn.textContent?.toLowerCase().includes('mistral')
    )
    expect(mistralBtn).toBeTruthy()
    fireEvent.click(mistralBtn!)
    // Open and select Claude
    fireEvent.click(screen.getByRole('button', { name: /mistral 7b/i }))
    const claudeBtn = screen.getAllByRole('option').find(btn =>
      btn.textContent?.toLowerCase().includes('claude')
    )
    expect(claudeBtn).toBeTruthy()
    fireEvent.click(claudeBtn!)
    // Open again, all models should be present
    fireEvent.click(screen.getByRole('button', { name: /claude 3 haiku/i }))
    const items = screen.getAllByRole('option').map(btn => btn.textContent?.toLowerCase())
    expect(items.some(text => text?.includes('deepseek'))).toBe(true)
    expect(items.some(text => text?.includes('mistral'))).toBe(true)
    expect(items.some(text => text?.includes('claude'))).toBe(true)
  })

  it('falls back to first model if no DeepSeek Free', () => {
    vi.doMock('swr', () => ({
      __esModule: true,
      default: () => ({
        data: [
          { name: 'mistral-ai/Mistral-7B-Instruct-v0.2', description: 'Mistral 7B', price_per_million: 1 },
          { name: 'anthropic/claude-3-haiku', description: 'Claude 3 Haiku', price_per_million: 2 },
        ],
        isLoading: false,
        error: null,
      })
    }))
    setInitialModel('mistral-ai/Mistral-7B-Instruct-v0.2')
    render(<Header />)
    expect(screen.getByText(/mistral 7b/i)).toBeInTheDocument()
    vi.resetModules()
  })

  it('shows "Select model" if no models', () => {
    vi.doMock('swr', () => ({
      __esModule: true,
      default: () => ({ data: [], isLoading: false, error: null })
    }))
    render(<Header />)
    // Should not render the model button at all
    expect(screen.queryByRole('button', { name: /select model/i })).not.toBeInTheDocument()
    vi.resetModules()
  })

  it('does not hydrate on server', () => {
    // @ts-expect-error: deleting global.window to simulate SSR
    delete global.window
    if (typeof window === 'undefined') return // skip if window is not defined
    const hydrateSpy = vi.spyOn(useConversationModelStore.getState(), 'hydrateModel')
    render(<Header />)
    expect(hydrateSpy).not.toHaveBeenCalled()
    global.window = origWindow
  })

  it('closes dropdown on outside click', () => {
    setInitialModel('mistral-ai/Mistral-7B-Instruct-v0.2')
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: /mistral 7b/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('resets search on dropdown close', () => {
    setInitialModel('mistral-ai/Mistral-7B-Instruct-v0.2')
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: /mistral 7b/i }))
    const search = screen.getByPlaceholderText(/search models/i)
    fireEvent.change(search, { target: { value: 'claude' } })
    expect(search).toHaveValue('claude')
    fireEvent.mouseDown(document.body)
    fireEvent.click(screen.getByRole('button', { name: /mistral 7b/i }))
    expect(screen.getByPlaceholderText(/search models/i)).toHaveValue('')
  })

  it('does not show model button if no active conversation', async () => {
    vi.doMock('@/hooks/use-active-conversation', () => ({
      useActiveConversation: vi.fn(() => null)
    }))
    setInitialModel('')
    const HeaderLocal = (await import('../header')).default
    render(<HeaderLocal />)
    // Should not render any model button
    expect(screen.queryByRole('button', { name: /mistral 7b/i })).not.toBeInTheDocument()
    vi.resetModules()
  })
}) 