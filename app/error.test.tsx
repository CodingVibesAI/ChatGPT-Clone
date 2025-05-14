import { render, screen } from '@testing-library/react'
import GlobalError from './error'

describe('GlobalError', () => {
  it('renders the error message', () => {
    const error = new Error('Test error')
    render(<GlobalError error={error} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('renders fallback text if no error message', () => {
    // @ts-expect-error purposely missing message
    render(<GlobalError error={{}} />)
    expect(screen.getByText('Unknown error')).toBeInTheDocument()
  })
}) 