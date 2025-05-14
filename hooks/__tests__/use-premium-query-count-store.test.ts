import { act } from 'react-dom/test-utils'
import { usePremiumQueryCountStore } from '../use-premium-query-count-store'

describe('usePremiumQueryCountStore', () => {
  beforeEach(() => {
    usePremiumQueryCountStore.getState().reset()
  })

  it('sets count and unlimited', () => {
    act(() => {
      usePremiumQueryCountStore.getState().set(42, false)
    })
    expect(usePremiumQueryCountStore.getState().count).toBe(42)
    expect(usePremiumQueryCountStore.getState().isUnlimited).toBe(false)
    act(() => {
      usePremiumQueryCountStore.getState().set(0, true)
    })
    expect(usePremiumQueryCountStore.getState().isUnlimited).toBe(true)
  })

  it('decrements count (not unlimited)', () => {
    act(() => {
      usePremiumQueryCountStore.getState().set(5, false)
      usePremiumQueryCountStore.getState().decrement()
    })
    expect(usePremiumQueryCountStore.getState().count).toBe(4)
  })

  it('does not decrement if unlimited', () => {
    act(() => {
      usePremiumQueryCountStore.getState().set(5, true)
      usePremiumQueryCountStore.getState().decrement()
    })
    expect(usePremiumQueryCountStore.getState().count).toBe(5)
  })

  it('does not go below zero', () => {
    act(() => {
      usePremiumQueryCountStore.getState().set(0, false)
      usePremiumQueryCountStore.getState().decrement()
    })
    expect(usePremiumQueryCountStore.getState().count).toBe(0)
  })

  it('resets to default', () => {
    act(() => {
      usePremiumQueryCountStore.getState().set(12, true)
      usePremiumQueryCountStore.getState().reset()
    })
    expect(usePremiumQueryCountStore.getState().count).toBe(50)
    expect(usePremiumQueryCountStore.getState().isUnlimited).toBe(false)
  })
}) 