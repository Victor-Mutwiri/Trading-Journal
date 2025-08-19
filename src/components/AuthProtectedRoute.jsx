import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AuthProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  // If user is authenticated, redirect to home
  if (session) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AuthProtectedRoute;