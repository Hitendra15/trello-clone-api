import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/bricolage-grotesque'
import './styles/tokens.css'
import './styles/base.css'
import './styles/shell.css'
import './styles/pages.css'
import './styles/board.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
