import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/onboarding.css';

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Germany', 'France', 'Kenya', 'Nigeria', 'South Africa', 'Other'
];

const experienceLevels = [
  { value: '0', label: 'Just starting (0 years)' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5+', label: '5+ years' }
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    country: '',
    experience: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.country) errs.country = 'Country is required';
    if (!form.experience) errs.experience = 'Experience level is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) {
      // Optionally save onboarding info to Supabase here
      setStep(2);
    }
  };

  const handleComplete = () => {
    navigate('/auth'); // Redirect to home screen
  };

  return (
    <div className="onboarding-root">
      {step === 1 ? (
        <form className="onboarding-form" onSubmit={handleNext}>
          <h1 className="onboarding-title">Tell us about yourself</h1>
          <div className="onboarding-field">
            <label>Country *</label>
            <select
              value={form.country}
              onChange={handleChange('country')}
              className="onboarding-input"
            >
              <option value="">Select your country</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.country && <span className="onboarding-error">{errors.country}</span>}
          </div>
          <div className="onboarding-field">
            <label>Trading Experience *</label>
            <select
              value={form.experience}
              onChange={handleChange('experience')}
              className="onboarding-input"
            >
              <option value="">Select experience level</option>
              {experienceLevels.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            {errors.experience && <span className="onboarding-error">{errors.experience}</span>}
          </div>
          <button type="submit" className="onboarding-btn">Next</button>
        </form>
      ) : (
        <div className="onboarding-congrats">
          <h2>Congratulations!</h2>
          <p>
            You’ve taken the first step in your journaling journey.<br />
            We wish you the best as you journal your trades and grow as a trader!
            <br />
            Now, Sign in to get started.
          </p>
          <button className="onboarding-btn" onClick={handleComplete}>Complete</button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;