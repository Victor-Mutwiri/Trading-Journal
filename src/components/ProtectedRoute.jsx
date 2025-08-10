import { useEffect, useState } from 'react';
import useStore from '../useStore'
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  /* const [session, setSession] = useState(null); */
  const { resetStore } = useStore();
  const navigate = useNavigate();
  /* const location = useLocation(); */

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        resetStore();
        localStorage.clear();
        navigate('/auth');
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        resetStore();
        localStorage.clear();
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, resetStore]);

  if (loading) return null; // Or a loading spinner

  /* if (!session) {
    return <Navigate to="/" state={{ from: location }} replace />;
  } */

  return children;
};

export default ProtectedRoute;