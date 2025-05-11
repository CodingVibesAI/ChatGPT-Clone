import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import Header from '../header'

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
const localMap: Record<string, string> = {}
vi.mock('@/hooks/use-conversation-model', () => ({
  useConversationModel: (convId: string, defaultModel: string) => {
    return {
      model: localMap[convId] || defaultModel,
      setModel: (model: string) => { localMap[convId] = model },
      isLoading: false,
    }
  }
}))

describe('Header model dropdown', () => {
  beforeEach(() => {
    Object.keys(localMap).forEach(k => delete localMap[k])
  })

  it('shows the preferred default model as label', () => {
    render(<Header />)
    expect(screen.getByText(/deepseek/i)).toBeInTheDocument()
  })

  it('opens the dropdown and shows all models', () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: /deepseek/i }))
    expect(screen.getByText(/mistral 7b/i)).toBeInTheDocument()
    expect(screen.getByText(/claude 3 haiku/i)).toBeInTheDocument()
  })

  it('can search for a model', async () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: /deepseek/i }))
    const search = screen.getByPlaceholderText(/search models/i)
    fireEvent.change(search, { target: { value: 'claude' } })
    expect(screen.getByText(/claude 3 haiku/i)).toBeInTheDocument()
    expect(screen.queryByText(/mistral 7b/i)).not.toBeInTheDocument()
  })

  it('can select a model and it moves to the top', async () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: /deepseek/i }))
    const mistralBtn = screen.getAllByRole('option').find(btn =>
      btn.textContent?.toLowerCase().includes('mistral')
    )
    expect(mistralBtn).toBeTruthy()
    fireEvent.click(mistralBtn!)
    // Dropdown closes, label updates
    expect(screen.getByRole('button', { name: /mistral/i })).toBeInTheDocument()
    // Open again, should be at top
    fireEvent.click(screen.getByRole('button', { name: /mistral/i }))
    const items = screen.getAllByRole('option')
    expect(items[0].textContent?.toLowerCase()).toContain('mistral')
  })

  it('all models remain in the dropdown after multiple selections', async () => {
    render(<Header />)
    // Open and select Mistral
    fireEvent.click(screen.getByRole('button', { name: /deepseek/i }))
    const mistralBtn = screen.getAllByRole('option').find(btn =>
      btn.textContent?.toLowerCase().includes('mistral')
    )
    expect(mistralBtn).toBeTruthy()
    fireEvent.click(mistralBtn!)
    // Open and select Claude
    fireEvent.click(screen.getByRole('button', { name: /mistral/i }))
    const claudeBtn = screen.getAllByRole('option').find(btn =>
      btn.textContent?.toLowerCase().includes('claude')
    )
    expect(claudeBtn).toBeTruthy()
    fireEvent.click(claudeBtn!)
    // Open again, all models should be present
    fireEvent.click(screen.getByRole('button', { name: /claude/i }))
    const items = screen.getAllByRole('option').map(btn => btn.textContent?.toLowerCase())
    expect(items.some(text => text?.includes('deepseek'))).toBe(true)
    expect(items.some(text => text?.includes('mistral'))).toBe(true)
    expect(items.some(text => text?.includes('claude'))).toBe(true)
  })
}) 