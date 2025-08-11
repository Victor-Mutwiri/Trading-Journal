import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  Settings, 
  LogOut,
  User,
  Bell,
  Activity
} from 'lucide-react';
import useStore from '../useStore'; // Adjust the import based on your project structure
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
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { resetStore } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  const { 
    setAccounts, 
    setDataLoaded, 
    setTrades,
    activeAccountId,
    setActiveAccountId
  } = useStore();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          navigate('/auth');
          return;
        }
        
        // 1. Fetch accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (accountsError) throw accountsError;

        if (accountsData) {
          const transformedAccounts = accountsData.map(account => ({
            id: account.id,
            name: account.account_name,
            balance: account.current_balance,
            initialBalance: account.initial_balance,
            accountType: account.account_type,
            brokerName: account.broker_name || '',
            dateCreated: account.created_at,
            transactions: []
          }));

          setAccounts(transformedAccounts);
          setDataLoaded('accounts');

          // Set active account if none is set
          const storedActiveId = localStorage.getItem('activeAccountId');
          if (!activeAccountId) {
            if (storedActiveId && transformedAccounts.some(acc => acc.id === storedActiveId)) {
              setActiveAccountId(storedActiveId);
            } else if (transformedAccounts.length > 0) {
              setActiveAccountId(transformedAccounts[0].id);
              localStorage.setItem('activeAccountId', transformedAccounts[0].id);
            }
          }

          // 2. Fetch trades for active account
          if (activeAccountId || transformedAccounts[0]?.id) {
            const activeId = activeAccountId || transformedAccounts[0]?.id;
            const { data: tradesData, error: tradesError } = await supabase
              .from('trades')
              .select('*')
              .eq('account_id', activeId)
              .order('date', { ascending: false });

            if (tradesError) throw tradesError;

            setTrades(tradesData || []);
            setDataLoaded('trades');
          }
        }

        setUserData(user);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load your data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate, setAccounts, setDataLoaded, setTrades, activeAccountId, setActiveAccountId]);

  const handleSignOut = () => {
    setShowLogoutModal(true);
  };
  const handleLogoutConfirm = async () => {
    try{
      await supabase.auth.signOut();
      resetStore(); // Reset the store if you're using Zustand or similar
      localStorage.clear();
      setShowLogoutModal(false);
      navigate('/', {replace:true});
    } catch (error) {
      console.error('Logout failed:', error);
    };
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
                Hello, welcome back
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
              {/* <button className="header-bell">
                <Bell className="bell-icon" />
                <span className="bell-indicator"></span>
              </button> */}
              <div className="header-user">
                <div className="user-avatar">
                  <User className="user-avatar-icon" />
                </div>
                {/* <span className="user-name">Kristi Kamhoma</span> */}
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