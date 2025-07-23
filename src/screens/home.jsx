import { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  Settings, 
  LogOut,
  User,
  Bell,
  Search,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {supabase} from '../supabaseClient'; // Adjust the import based on your project structure
import Dashboard from '../components/Dashboard';
import Journal from '../components/Journal';
import Accounts from '../components/Accounts';
import Settingz from '../components/Settings';
import LogoutModal from '../components/Logoutmodal';
import '../styles/home.css'; // Import your CSS file

const Home = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = () => {
    setShowLogoutModal(true);
  };
  const handleLogoutConfirm = async () => {
    await supabase.auth.signOut();
    setShowLogoutModal(false);
    navigate('/', {replace:true}); // Redirect to landing page
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'journal':
        return <Journal />;
      case 'accounts':
        return <Accounts />;
      case 'settings':
        return <Settingz />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="home-root">
      {/* Left Navigation Panel */}
      <div className="nav-panel">
        {/* Header */}
        <div className="nav-header">
          <div className="nav-header-inner">
            <div className="nav-logo">
              <Activity className="nav-logo-icon" />
            </div>
            <span className="nav-title">TradeJournal</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="nav-items">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-btn${activeTab === item.id ? ' nav-btn-active' : ''}`}
              >
                <Icon className="nav-btn-icon" />
                <span className="nav-btn-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="nav-signout">
          <button
            onClick={handleSignOut}
            className="signout-btn"
          >
            <LogOut className="signout-icon" />
            <span className="signout-label">Sign Out</span>
          </button>
        </div>
        <LogoutModal
          open={showLogoutModal}
          onClose={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
        />
      </div>

      {/* Right Content Area */}
      <div className="content-area">
        {/* Top Header */}
        <header className="content-header">
          <div className="header-row">
            <div>
              <h1 className="header-title">
                Hello, Kristi welcome back
              </h1>
              <p className="header-date">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="header-actions">
              <button className="header-bell">
                <Bell className="bell-icon" />
                <span className="bell-indicator"></span>
              </button>
              <div className="header-user">
                <div className="user-avatar">
                  <User className="user-avatar-icon" />
                </div>
                <span className="user-name">Kristi Kamhoma</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Home;