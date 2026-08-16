import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { invariant } from './invariant'

const root = document.getElementById('root')
invariant(root, 'Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
