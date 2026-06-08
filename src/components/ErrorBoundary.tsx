import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#080808',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', padding: 32,
        }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ color: '#CC0000', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
              Runtime Error
            </div>
            <div style={{ color: '#fff', fontSize: 14, marginBottom: 8 }}>
              {this.state.error.message}
            </div>
            <pre style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
