import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1526',
            color: '#e2e8f0',
            border: '1px solid rgba(56,189,248,0.2)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0d1526' } },
          error:   { iconTheme: { primary: '#f43f5e', secondary: '#0d1526' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
