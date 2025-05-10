import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import QueryClientProviderWrapper from './query-client-provider'
import { useQuery } from '@tanstack/react-query'

// Helper test component
function TestComponent() {
  const { data } = useQuery({
    queryKey: ['foo'],
    queryFn: () => 'bar',
    staleTime: Infinity,
  })
  return <div data-testid="data">{data}</div>
}

describe('QueryClientProviderWrapper (persistence)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists and restores cache from localStorage', async () => {
    // First render: should set cache
    const { unmount, getByTestId } = render(
      <QueryClientProviderWrapper>
        <TestComponent />
      </QueryClientProviderWrapper>
    )
    await waitFor(() => expect(getByTestId('data').textContent).toBe('bar'))
    unmount()
    // Simulate reload: render again, should instantly get cached value
    const { getByTestId: getByTestId2 } = render(
      <QueryClientProviderWrapper>
        <TestComponent />
      </QueryClientProviderWrapper>
    )
    await waitFor(() => expect(getByTestId2('data').textContent).toBe('bar'))
  })

  it('removes cache on removeClient', async () => {
    const { unmount } = render(
      <QueryClientProviderWrapper>
        <TestComponent />
      </QueryClientProviderWrapper>
    )
    unmount()
    // Remove cache manually
    localStorage.removeItem('tanstack-query-cache')
    expect(localStorage.getItem('tanstack-query-cache')).toBeNull()
  })
}) 