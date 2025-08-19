import { Navigate } from 'react-router-dom';

const OnboardingProtectedRoute = ({ children }) => {
  // Check for temporary signup token in localStorage
  const isFromSignup = localStorage.getItem('signupToken');

  if (!isFromSignup) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default OnboardingProtectedRoute;