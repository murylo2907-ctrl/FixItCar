import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ensureSeedAdministrador, ensureSeedAutopcsDemo } from './lib/localRegistry.js'

ensureSeedAdministrador()
ensureSeedAutopcsDemo()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
