import { Component } from 'react'
import { AlertOctagon } from 'lucide-react'
import Button from './Button'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    console.error('KrishiSahay error boundary:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <AlertOctagon className="w-12 h-12 text-red-500 mb-4" />
          <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
          <p className="text-current/60 mt-2 mb-6">Please refresh the page and try again.</p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      )
    }
    return this.props.children
  }
}
