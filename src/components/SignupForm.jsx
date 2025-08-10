import { useState } from 'react';
import '../styles/auth.css';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const SignupForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          error={!!validationErrors.firstName}
          helperText={validationErrors.firstName}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon icon={faUser} size="sm" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange('lastName')}
          error={!!validationErrors.lastName}
          helperText={validationErrors.lastName}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon icon={faUser} size="sm" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        error={!!validationErrors.email}
        helperText={validationErrors.email}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FontAwesomeIcon icon={faEnvelope} size="sm" />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange('password')}
        error={!!validationErrors.password}
        helperText={validationErrors.password}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FontAwesomeIcon icon={faLock} size="sm" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size="sm" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        fullWidth
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={!!validationErrors.confirmPassword}
        helperText={validationErrors.confirmPassword}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FontAwesomeIcon icon={faLock} size="sm" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} size="sm" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Account'}
      </Button>
      
    </Box>
  );
};

export default SignupForm;