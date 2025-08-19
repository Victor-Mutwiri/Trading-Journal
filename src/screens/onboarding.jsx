import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal, faSmileBeam } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import '../styles/onboarding.css';

const countries = [
  'Albania',
  'Algeria',
  'Andorra',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahrain',
  'Bangladesh',
  'Belarus',
  'Belgium',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Chile',
  'China',
  'Colombia',
  'Costa Rica',
  'Croatia',
  'Cyprus',
  'Denmark',
  'Djibouti',
  'Dominican Republic',
  'Egypt',
  'Estonia',
  'Fiji',
  'Finland',
  'France',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Guinea',
  'Hong Kong',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Ivory Coast',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kuwait',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Mexico',
  'Morocco',
  'Mozambique',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'South Africa',
  'Spain',
  'Sri Lanka',
  'Sweden',
  'Switzerland',
  'Syria',
  'Tanzania',
  'Thailand',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
  'Other'
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

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

  const handleNext = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const onboardingData = {
        country: form.country,
        experience_level: form.experience,
        created_at: new Date().toISOString()
      };
      const { error: saveError } = await supabase
          .from('onboarding')
          .insert([onboardingData]);
      if (saveError) {
          console.error('Error saving onboarding data:', saveError);
          toast.error('Failed to save your information. Please try again.');
          setIsSubmitting(false);
          return;
        }

      // Success - move to congratulations step
      setStep(2);
      toast.success('Information saved successfully!');
    } catch (error) {
      console.error('Unexpected error during onboarding:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {

    // Clear signup tokens
    localStorage.removeItem('signupToken');
    localStorage.removeItem('pendingEmail');
    
    // Store onboarding completion status
    localStorage.setItem('onboardingCompleted', 'true');
    navigate('/auth'); // Redirect to auth/home screen
  };

  return (
    <div className="onboarding-root">
      {step === 1 ? (
        <form className="onboarding-form" onSubmit={handleNext}>
          <h1 className="onboarding-title">Tell us about yourself</h1>
          <div className="onboarding-field">
            <label>Country *</label>
            <select
              required
              value={form.country}
              onChange={handleChange('country')}
              className="onboarding-input"
              disabled={isSubmitting}
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
              required
              value={form.experience}
              onChange={handleChange('experience')}
              className="onboarding-input"
              disabled={isSubmitting}
            >
              <option value="">Select experience level</option>
              {experienceLevels.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            {errors.experience && <span className="onboarding-error">{errors.experience}</span>}
          </div>
          <button 
            type="submit" 
            className="onboarding-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Next'}
          </button>
        </form>
      ) : (
        <div className="onboarding-congrats">
          <Confetti width={width} height={height} numberOfPieces={350} recycle={false} />
          <div className="congrats-icon-wrapper">
            <FontAwesomeIcon icon={faMedal} className="congrats-icon" />
          </div>
          <h2 className="congrats-title">
            Congratulations!
            <span style={{ marginLeft: 8 }}>
              <FontAwesomeIcon icon={faSmileBeam} color="#facc15" />
            </span>
          </h2>
          <p className="congrats-text">
            You've taken the <b>first step</b> in your journaling journey.<br />
            We wish you the best as you journal your trades and grow as a trader!
            <br /><br />
            <span style={{ color: '#2563eb', fontWeight: 500 }}>
              Now, Sign in to get started.
            </span>
          </p>
          <button className="onboarding-btn" onClick={handleComplete}>Complete</button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;