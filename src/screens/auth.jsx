import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {toast} from 'react-toastify'
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import '../styles/auth.css';
import { Box, Container, Typography, Alert, CircularProgress, IconButton, InputAdornment, TextField, Button, Link } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { faGoogle as faGoogleBrand, faGithub as faGithubBrand, faApple as faAppleBrand } from '@fortawesome/free-brands-svg-icons';

const Auth = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});

  // Signup form state
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupErrors, setSignupErrors] = useState({});

  const validateLogin = () => {
    const errors = {};
    if (!loginData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) errors.email = 'Email is invalid';
    if (!loginData.password) errors.password = 'Password is required';
    else if (loginData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignup = () => {
    const errors = {};
    if (!signupData.firstName) errors.firstName = 'First name is required';
    if (!signupData.lastName) errors.lastName = 'Last name is required';
    if (!signupData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) errors.email = 'Email is invalid';
    if (!signupData.password) errors.password = 'Password is required';
    else if (signupData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!signupData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (signupData.password !== signupData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      // Successfully logged in
      navigate('/home');
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
          }
        }
      });

      if (error) throw error;

      // Successfully signed up
      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (field) => (e) => {
    setLoginData(prev => ({ ...prev, [field]: e.target.value }));
    if (loginErrors[field]) {
      setLoginErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSignupChange = (field) => (e) => {
    setSignupData(prev => ({ ...prev, [field]: e.target.value }));
    if (signupErrors[field]) {
      setSignupErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setLoginErrors({});
    setSignupErrors({});
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            padding: { xs: 3, sm: 4 },
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              animation: 'shimmer 3s infinite',
            },
            '@keyframes shimmer': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' }
            }
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              Welcome
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.1rem'
              }}
            >
              {activeTab === 0 ? 'Sign in to your account' : 'Create your account'}
            </Typography>
          </Box>

          {/* Tab Buttons */}
          <Box
            sx={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '4px',
              mb: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {['Sign In', 'Sign Up'].map((label, index) => (
              <Box
                key={label}
                onClick={() => switchTab(index)}
                sx={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: activeTab === index ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                  background: activeTab === index ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  fontWeight: activeTab === index ? 600 : 400,
                  backdropFilter: activeTab === index ? 'blur(10px)' : 'none',
                  border: activeTab === index ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#fff'
                  }
                }}
              >
                {label}
              </Box>
            ))}
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ff6b6b',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                '& .MuiAlert-icon': {
                  color: '#ff6b6b'
                }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Forms */}
          {activeTab === 0 ? (
            // Login Form
            <Box
              component="form"
              onSubmit={handleLoginSubmit}
              sx={{
                animation: 'slideIn 0.5s ease-out',
                '@keyframes slideIn': {
                  from: { opacity: 0, transform: 'translateX(-20px)' },
                  to: { opacity: 1, transform: 'translateX(0)' }
                }
              }}
            >
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={loginData.email}
                onChange={handleLoginChange('email')}
                error={!!loginErrors.email}
                helperText={loginErrors.email}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fff',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ff6b6b',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesomeIcon icon={faEnvelope} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showLoginPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={handleLoginChange('password')}
                error={!!loginErrors.password}
                helperText={loginErrors.password}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fff',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ff6b6b',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesomeIcon icon={faLock} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      >
                        <FontAwesomeIcon icon={showLoginPassword ? faEyeSlash : faEye} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
                <Link 
                  href="#" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#fff',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 3,
                  py: 2,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2))',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(255, 255, 255, 0.1)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
              </Button>
            </Box>
          ) : (
            // Signup Form
            <Box
              component="form"
              onSubmit={handleSignupSubmit}
              sx={{
                animation: 'slideIn 0.5s ease-out',
                '@keyframes slideIn': {
                  from: { opacity: 0, transform: 'translateX(20px)' },
                  to: { opacity: 1, transform: 'translateX(0)' }
                }
              }}
            >
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={signupData.firstName}
                  onChange={handleSignupChange('firstName')}
                  error={!!signupErrors.firstName}
                  helperText={signupErrors.firstName}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#fff',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputBase-input': {
                      color: '#fff',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ff6b6b',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faUser} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={signupData.lastName}
                  onChange={handleSignupChange('lastName')}
                  error={!!signupErrors.lastName}
                  helperText={signupErrors.lastName}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#fff',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputBase-input': {
                      color: '#fff',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ff6b6b',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faUser} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={signupData.email}
                onChange={handleSignupChange('email')}
                error={!!signupErrors.email}
                helperText={signupErrors.email}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fff',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ff6b6b',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesomeIcon icon={faEnvelope} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showSignupPassword ? 'text' : 'password'}
                value={signupData.password}
                onChange={handleSignupChange('password')}
                error={!!signupErrors.password}
                helperText={signupErrors.password}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fff',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ff6b6b',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesomeIcon icon={faLock} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      >
                        <FontAwesomeIcon icon={showSignupPassword ? faEyeSlash : faEye} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={signupData.confirmPassword}
                onChange={handleSignupChange('confirmPassword')}
                error={!!signupErrors.confirmPassword}
                helperText={signupErrors.confirmPassword}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fff',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ff6b6b',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesomeIcon icon={faLock} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 3,
                  py: 2,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2))',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(255, 255, 255, 0.1)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Account'}
              </Button>
            </Box>
          )}

          {/* Divider */}
          <Box sx={{ position: 'relative', textAlign: 'center', my: 3 }}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.2)',
              }}
            />
            <Typography
              variant="body2"
              sx={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                px: 2,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              or continue with
            </Typography>
          </Box>

          {/* Social Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {[
              { icon: faGoogleBrand, label: 'Google' },
              { icon: faGithubBrand, label: 'GitHub' },
              { icon: faAppleBrand, label: 'Apple' }
            ].map(({ icon, label }) => (
              <Button
                key={label}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                <FontAwesomeIcon icon={icon} style={{ marginRight: '8px' }} />
                {label}
              </Button>
            ))}
          </Box>

          {/* Footer */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            {activeTab === 0 ? "Don't have an account? " : "Already have an account? "}
            <Link
              component="button"
              type="button"
              onClick={() => switchTab(activeTab === 0 ? 1 : 0)}
              sx={{
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {activeTab === 0 ? 'Sign up here' : 'Sign in here'}
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Auth;