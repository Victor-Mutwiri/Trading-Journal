import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Plus, 
  Trash2,
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  AlertTriangle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import '../styles/accounts.css';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactionType, setTransactionType] = useState('deposit');
  const [showBalance, setShowBalance] = useState(true);

  // Form states
  const [accountForm, setAccountForm] = useState({
    name: '',
    initialBalance: '',
    brokerName: '',
    accountType: 'Demo'
  });

  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Load accounts from localStorage on component mount
  useEffect(() => {
    const savedAccounts = localStorage.getItem('tradingAccounts');
    const savedActiveAccount = localStorage.getItem('activeAccountId');
    
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }
    if (savedActiveAccount) {
      setActiveAccountId(savedActiveAccount);
    }
  }, []);

  useEffect(() => {
  const fetchAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (!error && data) {
      const formatted = data.map(acc => ({
        id: acc.id,
        name: acc.account_name,
        brokerName: '', // Not in schema
        accountType: acc.account_type,
        balance: acc.current_balance,
        initialBalance: acc.initial_balance,
        dateCreated: acc.created_at,
        transactions: [] // You may want to fetch transactions separately
      }));
      setAccounts(formatted)

      let storedActive = localStorage.getItem('activeAccountId');
      if (!storedActive && formatted.length > 0) {
        setActiveAccountId(formatted[0].id);
        localStorage.setItem('activeAccountId', formatted[0].id);
      } else if (storedActive && formatted.some(acc => acc.id === storedActive)) {
        setActiveAccountId(storedActive);
      } else if (formatted.length === 1) {
        setActiveAccountId(formatted[0].id);
        localStorage.setItem('activeAccountId', formatted[0].id);
      }
    }
  };
  fetchAccounts();
}, []);

  // Save active account to localStorage
  useEffect(() => {
    if (activeAccountId) {
      localStorage.setItem('activeAccountId', activeAccountId);
    }
  }, [activeAccountId]);


  const handleCreateAccount = async () => {
    if (!accountForm.name.trim()) {
      toast.error('Account name is required');
      return;
    }

    if (!accountForm.initialBalance || parseFloat(accountForm.initialBalance) < 0) {
      toast.error('Please enter a valid initial balance');
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to create an account.');
      return;
    }

    // Insert into Supabase
    const { error, data } = await supabase
      .from('accounts')
      .insert([{
        user_id: user.id,
        account_name: accountForm.name.trim(),
        account_type: accountForm.accountType,
        initial_balance: parseFloat(accountForm.initialBalance),
        current_balance: parseFloat(accountForm.initialBalance)
      }])
      .select()
      .single();

    if (error) {
      toast.error('Failed to create account: ' + error.message);
      return;
    }

    // Optionally, fetch accounts again or add the new one to state
    setAccounts(prev => [...prev, {
      id: data.id,
      name: data.account_name,
      brokerName: '', // Not in schema
      accountType: data.account_type,
      balance: data.current_balance,
      initialBalance: data.initial_balance,
      dateCreated: data.created_at || new Date().toISOString(),
      transactions: [] // You may want to fetch transactions separately
    }]);

    setAccountForm({
      name: '',
      initialBalance: '',
      brokerName: '',
      accountType: 'Demo'
    });
    setShowCreateModal(false);
    toast.success('Account created successfully');
  };

  const handleTransaction = async () => {
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!selectedAccount) return;

    const amount = parseFloat(transactionForm.amount);

    // Calculate new balance
    let newBalance = selectedAccount.balance;
    if (transactionType === 'deposit') {
      newBalance += amount;
    } else {
      if (amount > selectedAccount.balance) {
        toast.error('Insufficient balance for withdrawal');
        return;
      }
      newBalance -= amount;
    }

    // 1. Insert transaction into Supabase
    const { error: txError } = await supabase.from('transactions').insert([{
      account_id: selectedAccount.id,
      type: transactionType,
      amount: amount,
      description: transactionForm.description,
      date: transactionForm.date
    }]);

    if (txError) {
      toast.error('Failed to save transaction: ' + txError.message);
      return;
    }

    // 2. Update account balance in Supabase
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ current_balance: newBalance })
      .eq('id', selectedAccount.id);

    if (updateError) {
      toast.error('Failed to update account balance: ' + updateError.message);
      return;
    }

    // 3. Update local state
    const updatedAccounts = accounts.map(account => {
      if (account.id === selectedAccount.id) {
        return {
          ...account,
          balance: newBalance,
          transactions: [
            ...account.transactions,
            {
              id: Date.now().toString(),
              type: transactionType,
              amount,
              date: transactionForm.date,
              description: transactionForm.description.trim() || `${transactionType} transaction`
            }
          ]
        };
      }
      return account;
    });

    setAccounts(updatedAccounts);
    setTransactionForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowTransactionModal(false);
    toast.success(`${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} completed successfully`);
  };

  const handleDeleteAccount = () => {
    if (!selectedAccount) return;

    const updatedAccounts = accounts.filter(account => account.id !== selectedAccount.id);
    setAccounts(updatedAccounts);

    // If deleted account was active, set new active account
    if (activeAccountId === selectedAccount.id) {
      setActiveAccountId(updatedAccounts.length > 0 ? updatedAccounts[0].id : null);
    }

    setShowDeleteModal(false);
    setSelectedAccount(null);
    toast.success('Account deleted successfully');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAccountSummary = (account) => {
    const deposits = account.transactions.filter(t => t.type === 'deposit');
    const withdrawals = account.transactions.filter(t => t.type === 'withdrawal');
    
    const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalDeposits,
      totalWithdrawals,
      netProfit: account.balance - account.initialBalance,
      transactionCount: account.transactions.length
    };
  };

  return (
    <div className="accounts-root">
      <div className="accounts-header">
        <div>
          <h2 className="accounts-title">Trading Accounts</h2>
          <p className="accounts-subtitle">Manage your trading accounts and track performance</p>
        </div>
        <div className="accounts-header-actions">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="accounts-balance-toggle"
          >
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            {showBalance ? 'Hide' : 'Show'} Balance
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={accounts.length >= 3}
            className="accounts-create-btn"
          >
            <Plus size={20} />
            Create Account
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="accounts-cards">
        {accounts.map(account => {
          const summary = getAccountSummary(account);
          const isActive = activeAccountId === account.id;

          return (
            <div
              key={account.id}
              className={`accounts-card${isActive ? ' active' : ''}`}
            >
              <div className="accounts-card-header">
                <div>
                  <h3 className="accounts-card-title">{account.name}</h3>
                  <p className="accounts-card-broker">{account.brokerName}</p>
                  <span className={`accounts-card-type${account.accountType === 'live' ? ' live' : ' demo'}`}>
                    {account.accountType.toUpperCase()}
                  </span>
                </div>
                <div className="accounts-card-actions">
                  <button
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowTransactionModal(true);
                    }}
                    className="accounts-card-action"
                  >
                    Transact
                    <DollarSign size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowDeleteModal(true);
                    }}
                    className="accounts-card-action delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Balance Section */}
              <div className="accounts-card-balance">
                <div className="accounts-card-balance-row">
                  <span>Current Balance</span>
                  <span className={`accounts-card-balance-value${showBalance ? '' : ' hidden'}`}>
                    {showBalance ? formatCurrency(account.balance) : '••••••'}
                  </span>
                </div>
                <div className="accounts-card-profit-row">
                  <div className={`accounts-card-profit${summary.netProfit >= 0 ? ' up' : ' down'}`}>
                    {summary.netProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>
                      {showBalance ? formatCurrency(Math.abs(summary.netProfit)) : '••••'}
                    </span>
                  </div>
                  <span className="accounts-card-profit-percent">
                    ({summary.netProfit >= 0 ? '+' : ''}{showBalance ? ((summary.netProfit / account.initialBalance) * 100).toFixed(2) : '••'}%)
                  </span>
                </div>
              </div>

              {/* Account Summary */}
              <div className="accounts-card-summary">
                <div>
                  <span>Total Deposits</span>
                  <span>{showBalance ? formatCurrency(summary.totalDeposits) : '••••••'}</span>
                </div>
                <div>
                  <span>Total Withdrawals</span>
                  <span>{showBalance ? formatCurrency(summary.totalWithdrawals) : '••••••'}</span>
                </div>
                <div>
                  <span>Date Created</span>
                  <span>{formatDate(account.dateCreated)}</span>
                </div>
                <div>
                  <span>Transactions</span>
                  <span>{summary.transactionCount}</span>
                </div>
              </div>

              {/* Active Account Button */}
              <button
                onClick={() => {
                  setActiveAccountId(account.id);
                  localStorage.setItem('activeAccountId', account.id);
                }}
                className={`accounts-card-active-btn${isActive ? ' active' : ''}`}
              >
                {isActive ? 'Active Account' : 'Set as Active'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {accounts.length === 0 && (
        <div className="accounts-empty">
          <div className="accounts-empty-icon">
            <DollarSign size={40} />
          </div>
          <h3 className="accounts-empty-title">No Trading Accounts</h3>
          <p className="accounts-empty-text">Create your first trading account to start journaling your trades</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="accounts-empty-btn"
          >
            Create Your First Account
          </button>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="accounts-modal-overlay">
          <div className="accounts-modal">
            <div className="accounts-modal-header">
              <h3>Create New Account</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="accounts-modal-close"
              >
                <X size={24} />
              </button>
            </div>
            <div className="accounts-modal-body">
              <div>
                <label>Account Name *</label>
                <input
                  type="text"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="accounts-input"
                  placeholder="e.g., My Trading Account"
                />
              </div>
              {/* <div>
                <label>Broker Name</label>
                <input
                  type="text"
                  value={accountForm.brokerName}
                  onChange={(e) => setAccountForm({ ...accountForm, brokerName: e.target.value })}
                  className="accounts-input"
                  placeholder="e.g., TD Ameritrade"
                />
              </div> */}
              <div>
                <label>Account Type</label>
                <select
                  value={accountForm.accountType}
                  onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                  className="accounts-input"
                >
                  <option value="Live">Live Account</option>
                  <option value="Demo">Demo Account</option>
                  <option value="Challenge">Challenge Account</option>
                </select>
              </div>
              <div>
                <label>Initial Balance *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={accountForm.initialBalance}
                  onChange={(e) => setAccountForm({ ...accountForm, initialBalance: e.target.value })}
                  className="accounts-input"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="accounts-modal-actions">
              <button
                onClick={() => setShowCreateModal(false)}
                className="accounts-btn cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                className="accounts-btn submit"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && selectedAccount && (
        <div className="accounts-modal-overlay">
          <div className="accounts-modal">
            <div className="accounts-modal-header">
              <h3>
                {transactionType === 'deposit' ? 'Deposit Money' : 'Withdraw Money'}
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="accounts-modal-close"
              >
                <X size={24} />
              </button>
            </div>
            <div className="accounts-modal-body">
              <div>
                <label>Transaction Type</label>
                <div className="accounts-transaction-type">
                  <button
                    onClick={() => setTransactionType('deposit')}
                    className={`accounts-transaction-btn${transactionType === 'deposit' ? ' deposit' : ''}`}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setTransactionType('withdrawal')}
                    className={`accounts-transaction-btn${transactionType === 'withdrawal' ? ' withdrawal' : ''}`}
                  >
                    Withdrawal
                  </button>
                </div>
              </div>
              <div>
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  className="accounts-input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                  className="accounts-input"
                />
              </div>
              <div>
                <label>Description</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  className="accounts-input"
                  placeholder="Optional description"
                />
              </div>
              <div className="accounts-balance-preview">
                <div>
                  <span>Current Balance:</span>
                  <span>{formatCurrency(selectedAccount.balance)}</span>
                </div>
                {transactionForm.amount && (
                  <div>
                    <span>New Balance:</span>
                    <span>
                      {formatCurrency(
                        transactionType === 'deposit'
                          ? selectedAccount.balance + parseFloat(transactionForm.amount || 0)
                          : selectedAccount.balance - parseFloat(transactionForm.amount || 0)
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="accounts-modal-actions">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="accounts-btn cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleTransaction}
                className={`accounts-btn submit${transactionType === 'deposit' ? ' deposit' : ' withdrawal'}`}
              >
                {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAccount && (
        <div className="accounts-modal-overlay">
          <div className="accounts-modal">
            <div className="accounts-modal-delete-header">
              <div className="accounts-modal-delete-icon">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3>Delete Account</h3>
                <p>This action cannot be undone</p>
              </div>
            </div>
            <div className="accounts-modal-delete-warning">
              <p>
                <strong>Warning:</strong> Deleting "{selectedAccount.name}" will permanently remove:
              </p>
              <ul>
                <li>All trading journal entries</li>
                <li>Transaction history</li>
                <li>Performance analytics</li>
                <li>Account balance data</li>
              </ul>
            </div>
            <div className="accounts-modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="accounts-btn cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="accounts-btn submit withdrawal"
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

export default Accounts;