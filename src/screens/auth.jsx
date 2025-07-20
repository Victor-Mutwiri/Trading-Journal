import { supabase } from '../supabaseClient';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import { Box, Container, Paper, Tabs, Tab, Typography, Link } from '@mui/material';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

const Auth = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(''); // Clear error when switching tabs
  };

  const handleLogin = async (formData) => {
      setLoading(true);
      setError('');
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate('/home'); // Redirect to onboarding after login
        // Redirect or set user state here
      } catch (err) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    };

    const handleSignup = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });
      if (error) throw error;
      navigate('/onboarding'); // Redirect to onboarding after signup
      // Redirect or set user state here
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600, color: 'primary.main' }}
          >
            Welcome
          </Typography>
          
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {activeTab === 0 ? 'Sign in to your account' : 'Create a new account'}
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 2 }}
            >
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>
          </Box>
          
          {activeTab === 0 ? (
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={error}
            />
          ) : (
            <SignupForm
              onSubmit={handleSignup}
              loading={loading}
              error={error}
            />
          )}
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0 ? "Don't have an account? " : "Already have an account? "}
              <Link
                component="button"
                variant="body2"
                onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)}
                sx={{ textDecoration: 'none' }}
              >
                {activeTab === 0 ? 'Sign up here' : 'Sign in here'}
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Auth;