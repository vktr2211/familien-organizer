import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// PWA Update Handler
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Reload page when new service worker takes control
    window.location.reload()
  })
}

// Register for PWA update notifications
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Update found
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            showUpdateBanner()
          }
        })
      })
    })
  }
})

function showUpdateBanner() {
  const updateBanner = document.createElement('div')
  updateBanner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `
  
  updateBanner.innerHTML = `
    <div>
      <div style="font-weight: bold; margin-bottom: 4px;">🎉 Update verfügbar</div>
      <div style="font-size: 14px; opacity: 0.9;">Neue Features und Verbesserungen sind bereit</div>
    </div>
    <button id="update-btn" style="
      background: white;
      color: #10b981;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
    ">Aktualisieren</button>
    <button id="close-update" style="
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      margin-left: 8px;
    ">×</button>
  `
  
  document.body.appendChild(updateBanner)
  
  // Update button click
  document.getElementById('update-btn').addEventListener('click', () => {
    window.location.reload()
  })
  
  // Close banner
  document.getElementById('close-update').addEventListener('click', () => {
    updateBanner.remove()
  })
  
  // Auto-hide after 30 seconds
  setTimeout(() => {
    if (updateBanner.parentNode) {
      updateBanner.remove()
    }
  }, 30000)
}

// Performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      console.log('Navigation timing:', {
        'DNS': entry.domainLookupEnd - entry.domainLookupStart,
        'Connect': entry.connectEnd - entry.connectStart,
        'Request': entry.responseStart - entry.requestStart,
        'Response': entry.responseEnd - entry.responseStart,
        'DOM Interactive': entry.domInteractive - entry.navigationStart,
        'DOM Complete': entry.domComplete - entry.navigationStart,
        'Load Complete': entry.loadEventEnd - entry.navigationStart
      })
    }
  }
})

observer.observe({ entryTypes: ['navigation'] })

// Error Boundary for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😔</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#374151' }}>
            Etwas ist schiefgelaufen
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px' }}>
            Die App konnte nicht geladen werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            App neu laden
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '2rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#6b7280' }}>
                Fehlerdetails (Development)
              </summary>
              <pre style={{
                background: '#f3f4f6',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '1rem'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// App mounting with Error Boundary
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)