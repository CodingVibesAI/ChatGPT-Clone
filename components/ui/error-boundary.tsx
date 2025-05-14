import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch() {
    // Optionally log error to an error reporting service
    // console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#181a20] text-[#ececf1]">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <pre className="text-sm text-[#b4bcd0] bg-[#23272f] rounded p-4 max-w-xl overflow-x-auto">
            {this.state.error?.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
} 