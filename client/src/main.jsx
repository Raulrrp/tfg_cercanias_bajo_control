// useful for dev, gives us feedback
import { StrictMode } from 'react'
// imports elements to give additional functionality to html
import { createRoot } from 'react-dom/client'
import './index.css'
// to use the methods inside Home.jsx
import Home from './pages/Home.jsx'

// app initialization
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*looks for App function and executes it*/}
    <Home />
  </StrictMode>,
)
