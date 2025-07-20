import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Home from './screens/home'
import Auth from './screens/auth'
import LandingPage from './screens/landingpage'
import Onboarding from './screens/onboarding'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/" replace />} />  
      </Routes>
    </Router>
  )
}

export default App
