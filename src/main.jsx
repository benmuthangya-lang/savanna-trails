import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/base.css'
import './styles/header-hero.css'
import './styles/tours.css'
import './styles/enquiry.css'
import './styles/about-footer.css'
import './styles/responsive.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
