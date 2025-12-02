import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/health`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        setHealthStatus(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to API')
        setHealthStatus(null)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
    // Refresh every 5 seconds
    const interval = setInterval(checkHealth, 5000)
    return () => clearInterval(interval)
  }, [apiUrl])

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return '#10b981' // green
      case 'degraded':
      case 'disconnected':
        return '#ef4444' // red
      default:
        return '#f59e0b' // yellow
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'Healthy'
      case 'connected':
        return 'Connected'
      case 'degraded':
        return 'Degraded'
      case 'disconnected':
        return 'Disconnected'
      default:
        return 'Unknown'
    }
  }

  return (
    <main style={
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)'
    }>
      <div style={
        maxWidth: '56rem',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '2rem'
      }>
        <h1 style={
          fontSize: '2.25rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '1rem',
          color: '#1f2937'
        }>
          Welcome to Test8
        </h1>
        <p style={
          textAlign: 'center',
          color: '#4b5563',
          marginBottom: '2rem'
        }>
          Test
        </p>

        <div style={
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1.5rem'
        }>
          <h2 style={
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#374151'
          }>
            System Status
          </h2>
          
          {loading ? (
            <div style={ textAlign: 'center', padding: '1rem' }>
              <div style={
                display: 'inline-block',
                width: '2rem',
                height: '2rem',
                border: '2px solid #3b82f6',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }></div>
              <p style={ marginTop: '0.5rem', color: '#6b7280' }>Checking system status...</p>
            </div>
          ) : error ? (
            <div style={
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1rem'
            }>
              <p style={ color: '#991b1b', fontWeight: '500' }>Warning: Connection Error</p>
              <p style={ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }>{error}</p>
              <p style={ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.5rem' }>API URL: {apiUrl}</p>
            </div>
          ) : healthStatus ? (
            <div style={ display: 'flex', flexDirection: 'column', gap: '1rem' }>
              <div style={
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }>
                <span style={ fontWeight: '500', color: '#374151' }>Overall Status</span>
                <div style={ display: 'flex', alignItems: 'center', gap: '0.5rem' }>
                  <span style={
                    width: '0.75rem',
                    height: '0.75rem',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(healthStatus.status)
                  }></span>
                  <span style={ fontWeight: '600' }>{getStatusText(healthStatus.status)}</span>
                </div>
              </div>

              <div style={
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }>
                <div>
                  <span style={ fontWeight: '500', color: '#374151' }>API Service</span>
                  <p style={ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }>
                    Last checked: {new Date(healthStatus.api?.timestamp || Date.now()).toLocaleTimeString()}
                  </p>
                </div>
                <div style={ display: 'flex', alignItems: 'center', gap: '0.5rem' }>
                  <span style={
                    width: '0.75rem',
                    height: '0.75rem',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(healthStatus.api?.status || 'unknown')
                  }></span>
                  <span style={ fontWeight: '600' }>{getStatusText(healthStatus.api?.status || 'unknown')}</span>
                </div>
              </div>

              <div style={
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }>
                <div>
                  <span style={ fontWeight: '500', color: '#374151' }>Database Connection</span>
                  {healthStatus.database?.error && (
                    <p style={ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }>
                      {healthStatus.database.error}
                    </p>
                  )}
                </div>
                <div style={ display: 'flex', alignItems: 'center', gap: '0.5rem' }>
                  <span style={
                    width: '0.75rem',
                    height: '0.75rem',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(healthStatus.database?.status || 'unknown')
                  }></span>
                  <span style={ fontWeight: '600' }>{getStatusText(healthStatus.database?.status || 'unknown')}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div style={
          borderTop: '1px solid #e5e7eb',
          marginTop: '1.5rem',
          paddingTop: '1.5rem'
        }>
          <h3 style={
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#6b7280',
            marginBottom: '0.5rem'
          }>
            Environment Information
          </h3>
          <div style={ fontSize: '0.75rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.25rem' }>
            <p>API Endpoint: <code style={ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }>{apiUrl}</code></p>
            <p>Environment: <code style={ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }>{import.meta.env.MODE || 'development'}</code></p>
          </div>
        </div>
      </div>
      
      <style>{
        `@keyframes spin {
          to { transform: rotate(360deg); }
        }`
      }</style>
    </main>
  )
}

export default App
