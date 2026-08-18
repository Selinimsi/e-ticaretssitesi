import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n' // import i18n
import { ThemeProvider } from './contexts/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Suspense fallback={<div className="flex items-center justify-center h-screen dark:bg-gray-900 dark:text-white">Yükleniyor / Loading...</div>}>
        <App />
      </Suspense>
    </ThemeProvider>
  </React.StrictMode>,
)
