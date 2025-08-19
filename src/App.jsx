import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AuthProtectedRoute from './components/AuthProtectedRoute'
import OnboardingProtectedRoute from './components/OnboardingProtectedRoute'
import Home from './screens/home'
import Auth from './screens/auth'
import LandingPage from './screens/landingpage'
import Onboarding from './screens/onboarding'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/auth" 
          element={
            <AuthProtectedRoute>
              <Auth />
            </AuthProtectedRoute>
          } 
        />
        <Route
          path="/onboarding"
          element={
            <OnboardingProtectedRoute>
              <Onboarding />
            </OnboardingProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />  
      </Routes>
    </Router>
  )
}

export default App
