import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useStore from '../useStore';
import '../styles/settingz.css';

const Settingz = () => {
  const { userData, userDataLoaded, setUserData } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userDataLoaded) {
        try {
          setLoading(true);
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) throw userError;

          if (user) {
            // Get additional user profile data
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('display_name, created_at')
              .eq('id', user.id)
              .single();

            if (profileError) throw profileError;

            const userData = {
              id: user.id,
              email: user.email,
              memberSince: new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              }),
              created_at: user.created_at
            };

            setUserData(userData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userDataLoaded, setUserData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handlePasswordChange = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    alert('Password updated successfully');
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleDeleteAccount = () => {
    alert('Account deletion initiated. This would normally redirect to confirmation page.');
    setShowDeleteConfirm(false);
  };

  const sections = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' }
  ];

  return (
    <div className="settings-container">
      {/* <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your profile information and preferences.</p>
      </div> */}

      <div className="settings-layout">
        <nav className="settings-sidebar">
          {sections.map(section => (
            <button
              key={section.id}
              className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="sidebar-icon">{section.icon}</span>
              <span className="sidebar-label">{section.label}</span>
            </button>
          ))}
        </nav>

        <main className="settings-content">
          {activeSection === 'account' && (
            <div className="settings-section">
              <h3>Account Information</h3>
              
              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    value={userData?.email || ''}
                    className="form-input"
                    disabled
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      cursor: 'not-allowed' 
                    }}
                  />
                  <p className="form-text">Your email address cannot be changed</p>
                </div>
              </div>

              <div className="form-group">
                <label>Account Creation</label>
                <p className="form-text">
                  Member since {userData?.created_at || 'Loading ...'}
                </p>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              
              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <button onClick={handlePasswordChange} className="btn btn-primary">
                  Change Password
                </button>
              </div>

              {/* <div className="security-info">
                <h4>Two-Factor Authentication</h4>
                <p className="form-text">Add an extra layer of security to your account</p>
                <button className="btn btn-secondary">Enable 2FA</button>
              </div> */}
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="settings-section">
              <h3>Privacy & Data</h3>
              
              <div className="settings-form">
                {/* <div className="form-group">
                  <h4>Data Export</h4>
                  <p className="form-text">Download a copy of your personal data</p>
                  <button className="btn btn-secondary">Export Data</button>
                </div> */}

                {/* <div className="form-group">
                  <h4>Privacy Settings</h4>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="profileVisibility"
                      name="profileVisibility"
                      defaultChecked={true}
                      className="form-checkbox"
                    />
                    <label htmlFor="profileVisibility">
                      <strong>Public Profile</strong>
                      <span className="form-text">Make your profile visible to other users</span>
                    </label>
                  </div>
                </div> */}

                <div className="danger-zone">
                  <h4>Danger Zone</h4>
                  <p className="form-text">Once you delete your account, there is no going back. Please be certain.</p>
                  <button 
                    className="btn btn-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settingz;