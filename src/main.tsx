import { createRoot } from 'react-dom/client'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

const isAdmin = window.location.pathname.startsWith('/admin')

async function boot() {
  if (isAdmin) {
    const { default: AdminApp } = await import('./AdminApp')
    createRoot(document.getElementById('root')!).render(
      <ErrorBoundary><AdminApp /></ErrorBoundary>
    )
  } else {
    const { default: App } = await import('./App')
    createRoot(document.getElementById('root')!).render(
      <ErrorBoundary><App /></ErrorBoundary>
    )
  }
}

boot()
