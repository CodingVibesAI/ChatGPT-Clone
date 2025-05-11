import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatMessage from '../chat-message'
import React from 'react'

describe('ChatMessage <think> block rendering', () => {
  it('renders a single <think> block as normal markdown', () => {
    render(<ChatMessage role="assistant" content={"<think>This is a thought only.</think>"} />)
    expect(screen.getByText(/this is a thought only/i)).toBeInTheDocument()
    expect(screen.queryByText(/AI is thinking/i)).not.toBeInTheDocument()
  })

  it('renders <think> block as a bubble when mixed with other content', () => {
    render(<ChatMessage role="assistant" content={"Hello!<think>This is a thought.</think>Goodbye."} />)
    expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument()
    expect(screen.getByText(/this is a thought/i)).toBeInTheDocument()
    expect(screen.getByText(/hello/i)).toBeInTheDocument()
    expect(screen.getByText(/goodbye/i)).toBeInTheDocument()
  })

  it('removes stray <think> with no close', () => {
    render(<ChatMessage role="assistant" content={"Hello! <think> This is not a block."} />)
    expect(screen.getByText(/hello/i)).toBeInTheDocument()
    expect(screen.queryByText(/AI is thinking/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/this is not a block/i)).toBeInTheDocument()
  })

  it('ignores empty <think> blocks', () => {
    render(<ChatMessage role="assistant" content={"Hello!<think>   </think>Goodbye."} />)
    expect(screen.getByText(/hello/i)).toBeInTheDocument()
    expect(screen.getByText(/goodbye/i)).toBeInTheDocument()
    expect(screen.queryByText(/AI is thinking/i)).not.toBeInTheDocument()
  })

  it('renders normal markdown', () => {
    render(<ChatMessage role="assistant" content={"**Bold** _italic_"} />)
    expect(screen.getByText(/bold/i)).toBeInTheDocument()
    expect(screen.getByText(/italic/i)).toBeInTheDocument()
  })
}) 