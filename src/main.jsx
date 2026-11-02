import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import './campus-theme.css'
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
