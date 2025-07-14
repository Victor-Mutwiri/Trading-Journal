import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Home from './screens/home'
import Auth from './screens/auth'
import LandingPage from './screens/landingpage'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/auth" element={<Auth />} />  
      </Routes>
    </Router>
  )
}

export default App
