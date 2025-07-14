import { useState } from 'react';
import '../styles/auth.css';
import { Box, Container, Paper, Tabs, Tab, Typography, Link } from '@mui/material';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

const Auth = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(''); // Clear error when switching tabs
  };

  const handleLogin = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock authentication logic
      console.log('Login attempt:', formData);
      
      // Simulate success/failure
      if (formData.email === 'demo@example.com' && formData.password === 'demo123') {
        console.log('Login successful');
        // Handle successful login (redirect, set user state, etc.)
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock registration logic
      console.log('Signup attempt:', formData);
      
      // Simulate success
      console.log('Signup successful');
      // Handle successful signup (redirect, set user state, etc.)
    } catch (err) {
      setError(err.message || 'An error occurred during signup');
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