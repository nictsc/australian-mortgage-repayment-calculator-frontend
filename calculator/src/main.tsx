import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// getElementById can return null, but we know #root exists in index.html.
// The `!` is a non-null assertion: it tells TypeScript "trust me, this isn't null".
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
