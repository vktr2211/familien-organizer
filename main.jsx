import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unbehandelter Fehler in der App', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
          <h1 className="mb-2 text-2xl font-semibold">Etwas ist schiefgelaufen</h1>
          <p className="mb-6 max-w-md text-center text-slate-200">
            Bitte aktualisiere die Seite oder starte die Anwendung neu. Deine lokalen Daten
            bleiben erhalten.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-card"
          >
            Neu versuchen
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

const root = createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>
)

if ('serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({ immediate: true })
    })
    .catch((error) => {
      console.error('Service Worker Registrierung fehlgeschlagen', error)
    })
}