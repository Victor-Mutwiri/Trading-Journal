import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useStore from '../useStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTimes,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { toast } from 'react-toastify';
import '../styles/journal.css';

const Journal = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeAccount, setActiveAccount] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTrade, setPendingTrade] = useState(null);
  const { updateAccount, addTrade } = useStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const [formData, setFormData] = useState({
    account_id: '',
    date: '',
    currency_pair: '',
    trade_type: '',
    lot_size: '',
    profit_loss: '',
    commission: '',
    spread: '',
    emotion: 'Neutral',
    notes: ''
  });

    // Fetch active account on mount
    useEffect(() => {
      const fetchActiveAccount = async () => {
        const activeAccountId = localStorage.getItem('activeAccountId');
        if (!activeAccountId) return;
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', activeAccountId)
          .single();
        if (!error && data) {
          setActiveAccount(data);
          setFormData(f => ({ ...f, account_id: data.id }));
        }
      };
      fetchActiveAccount();
    }, []);

    const currencyPairs = [
    'AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD',
    'CAD/CHF', 'CAD/JPY',
    'CHF/JPY',
    'EUR/AUD', 'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/NZD', 'EUR/USD',
    'GBP/AUD', 'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/NZD', 'GBP/USD',
    'NZD/CAD', 'NZD/CHF', 'NZD/JPY', 'NZD/USD',
    'USD/CAD', 'USD/CHF', 'USD/CNH', 'USD/JPY', 'USD/MXN', 'USD/NOK', 'USD/SEK', 'USD/SGD', 'USD/TRY', 'USD/ZAR',
    // ===== Metals =====
    'XAG/USD', // Silver
    'XAU/USD', // Gold
    'XPD/USD', // Palladium
    'XPT/USD', // Platinum

    // ===== Indices =====
    'AU200',  // ASX 200
    'DE40',   // DAX Germany
    'FR40',   // CAC 40
    'HK50',   // Hang Seng
    'JP225',  // Nikkei 225
    'NAS100', // Nasdaq 100
    'UK100',  // FTSE 100
    'US30',   // Dow Jones
    'US500',  // S&P 500

    // ===== Energies =====
    'BRENT/USD', // Brent Oil
    'NGAS/USD',  // Natural Gas
    'WTI/USD',   // West Texas Oil

    // ===== Cryptocurrencies =====
    'ADA/USD',
    'BTC/USD',
    'ETH/USD',
    'LTC/USD',
    'XRP/USD'
    ];

  const emotions = [
    'Anxious', 'Confident','Greedy', 'Fearful', 'Neutral', "Overconfident",
    'Frustrated', 'Hopeful', 'Proud', 'Regretful', 'Risky' 
  ];

  const tradeTypes = ['Buy', 'Sell'];

    // Handle form submission
    const handleFormSubmit = async (e) => {
      e.preventDefault();

      // Basic validation
      if (
        !formData.account_id ||
        !formData.date ||
        !formData.currency_pair ||
        !formData.trade_type ||
        !formData.lot_size
      ) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Calculate net_pnl
      const net_pnl =
        parseFloat(formData.profit_loss || 0) -
        parseFloat(formData.commission || 0) -
        parseFloat(formData.spread || 0);

      // Prepare trade object for Supabase
      const trade = {
        account_id: formData.account_id,
        date: formData.date,
        currency_pair: formData.currency_pair,
        trade_type: formData.trade_type,
        lot_size: parseFloat(formData.lot_size),
        profit_loss: parseFloat(formData.profit_loss || 0),
        commission: parseFloat(formData.commission || 0),
        spread: parseFloat(formData.spread || 0),
        net_pnl,
        emotion: formData.emotion,
        notes: formData.notes
      };

      setPendingTrade(trade);
      setShowConfirmModal(true);
    };

  const resetForm = () => {
    setFormData({
      account_id: '',
      date: '',
      currency_pair: '',
      trade_type: '',
      lot_size: '',
      profit_loss: '',
      commission: '',
      spread: '',
      emotion: 'Neutral',
      notes: ''
    });
  };

  {showConfirmModal && pendingTrade && (
    <div className="journal-modal-overlay">
      <div className="journal-modal">
        <div className="journal-modal-header">
          <h2 className="journal-modal-title">Confirm Trade Details</h2>
          <button
            className="journal-modal-close"
            onClick={() => setShowConfirmModal(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div style={{ marginBottom: 24, textAlign: 'left', color: '#fff' }}>
          <div><b>Date:</b> {new Date(pendingTrade.date).toLocaleString()}</div>
          <div><b>Pair:</b> {pendingTrade.currency_pair}</div>
          <div><b>Trade Type:</b> {pendingTrade.trade_type}</div>
          <div>
            <b>{pendingTrade.profit_loss >= 0 ? 'Profit' : 'Loss'}:</b>
            <span style={{ color: pendingTrade.profit_loss >= 0 ? '#22c55e' : '#ef4444', marginLeft: 6 }}>
              {pendingTrade.profit_loss >= 0 ? '+' : '-'}{Math.abs(pendingTrade.profit_loss)}
            </span>
          </div>
          <div><b>Lot Size:</b> {pendingTrade.lot_size}</div>
          <div>
            <b>Commission:</b>
            <span style={{ color: '#ef4444', marginLeft: 6 }}>
              -{Math.abs(pendingTrade.commission)}
            </span>
          </div>
          <div>
            <b>Spread:</b>
            <span style={{ color: '#ef4444', marginLeft: 6 }}>
              -{Math.abs(pendingTrade.spread)}
            </span>
          </div>
          <div><b>Emotion:</b> {pendingTrade.emotion}</div>
          <div><b>Notes:</b> {pendingTrade.notes || <span style={{ color: '#a1a1aa' }}>None</span>}</div>
        </div>
        <div className="journal-form-actions">
          <button
            className="journal-btn cancel"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </button>
          <button
            className="journal-btn submit"
            onClick={async () => {
              // Save to Supabase
              const { error } = await supabase.from('trades').insert([pendingTrade]);
              if (error) {
                toast.error('Failed to save trade: ' + error.message);
                return;
              }
              // After inserting the trade
              await supabase
                .from('accounts')
                .update({ current_balance: activeAccount.current_balance + pendingTrade.net_pnl })
                .eq('id', activeAccount.id);

              //Trigger refresh for Accounts component
              localStorage.setItem('accountsNeedsRefresh', Date.now());
              
              toast.success('Trade added successfully!');
              setShowConfirmModal(false);
              setShowAddForm(false);
              resetForm();
            }}
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  )}

  return (
    <div className="journal-root">
      {/* Account Info Label */}
      <div className="journal-account-select-bar">
        <label className="journal-account-label">
          Journaling to Account:
        </label>
        <span className="journal-account-label-selected">
          {activeAccount ? activeAccount.account_name : 'No active account selected'}
        </span>
      </div>
      <div className="journal-container">
        {/* Header */}
        <div className="journal-header">
          <div className="journal-header-left">
            <div className="journal-header-icon">
              <FontAwesomeIcon icon={faChartLine} className="icon-lg" />
            </div>
            <div>
              <h1 className="journal-title">Trading Journal</h1>
              <p className="journal-subtitle">Record your trades and track your progress</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              // Reset form when showing it
              setFormData({
                account_id: activeAccount?.id || '',
                date: '',
                currency_pair: '',
                trade_type: '',
                lot_size: '',
                profit_loss: '',
                commission: '',
                spread: '',
                emotion: 'Neutral',
                notes: ''
              });
            }}
            className="journal-add-btn"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Trade</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="journal-main-content">
          {!showAddForm ? (
            <div className="journal-empty-state">
              <div className="journal-empty-icon">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <h2>Ready to record your next trade?</h2>
              <p>Keep track of your trading activity by adding each trade with detailed information.</p>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  // Reset form when showing it
                  setFormData({
                    account_id: activeAccount?.id || '',
                    date: '',
                    currency_pair: '',
                    trade_type: '',
                    lot_size: '',
                    profit_loss: '',
                    commission: '',
                    spread: '',
                    emotion: 'Neutral',
                    notes: ''
                  });
                }}
                className="journal-add-btn"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Trade</span>
              </button>
            </div>
          ) : (
            <div className="journal-form-container">
              <div className="journal-form-header">
                <h2 className="journal-form-title">Add New Trade</h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="journal-form-close"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="journal-form">
                <div className="journal-form-grid">
                  <div>
                    <label className="journal-label">
                      Trade Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="journal-input"
                    />
                  </div>
                  <div>
                    <label className="journal-label">
                      Trading Instrument *
                    </label>
                    <select
                      value={formData.currency_pair}
                      onChange={(e) => setFormData({ ...formData, currency_pair: e.target.value })}
                      required
                      className="journal-input"
                    >
                      <option value="" disabled>Select Instrument</option>
                      {currencyPairs.map(pair => (
                        <option key={pair} value={pair}>{pair}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="journal-label">
                      Trade Type *
                    </label>
                    <select
                      value={formData.trade_type}
                      onChange={(e) => setFormData({ ...formData, trade_type: e.target.value })}
                      required
                      className="journal-input"
                    >
                      <option value="" disabled>Select trade type</option>
                      {tradeTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="journal-label">
                      Lot Size *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.lot_size}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val.startsWith('-')) {
                          setFormData({ ...formData, lot_size: e.target.value });
                        }
                      }}
                      required
                      className="journal-input"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="journal-label">
                      Profit/Loss
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.profit_loss}
                      onChange={(e) => setFormData({ ...formData, profit_loss: e.target.value })}
                      className="journal-input"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="journal-label">
                      Commission
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.commission}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Prevent entering a negative sign
                        if (!val.startsWith('-')) {
                          setFormData({ ...formData, commission: val });
                        }
                      }}
                      className="journal-input"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="journal-label">
                      Spread
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.spread}
                      onChange={(e) => setFormData({ ...formData, spread: e.target.value })}
                      className="journal-input"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="journal-label">
                      Emotion
                    </label>
                    <select
                      value={formData.emotion}
                      onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                      className="journal-input"
                    >
                      {emotions.map(emotion => (
                        <option key={emotion} value={emotion}>{emotion}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="journal-label">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="journal-input"
                    placeholder="Add any additional notes about this trade..."
                  />
                </div>
                <div className="journal-form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setPendingTrade(null);
                      resetForm();
                      setFormData({
                        account_id: activeAccount?.id || '',
                        date: '',
                        currency_pair: '',
                        trade_type: '',
                        lot_size: '',
                        profit_loss: '',
                        commission: '',
                        spread: '',
                        emotion: 'Neutral',
                        notes: ''
                      });
                    }}
                    className="journal-btn cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="journal-btn submit"
                  >
                    Add Trade
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      {showConfirmModal && pendingTrade && (
        <div className="journal-modal-overlay">
          <div className="journal-modal">
            <div className="journal-modal-header">
              <h2 className="journal-modal-title">Confirm Trade Details</h2>
              <button
                className="journal-modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div style={{ marginBottom: 24, textAlign: 'left', color: '#fff' }}>
              <div><b>Date:</b> {new Date(pendingTrade.date).toLocaleString()}</div>
              <div><b>Pair:</b> {pendingTrade.currency_pair}</div>
              <div><b>Trade Type:</b> {pendingTrade.trade_type}</div>
              <div>
                <b>{pendingTrade.profit_loss >= 0 ? 'Profit' : 'Loss'}:</b>
                <span style={{ color: pendingTrade.profit_loss >= 0 ? '#22c55e' : '#ef4444', marginLeft: 6 }}>
                  {pendingTrade.profit_loss >= 0 ? '+' : '-'}{Math.abs(pendingTrade.profit_loss)}
                </span>
              </div>
              <div><b>Lot Size:</b> {pendingTrade.lot_size}</div>
              <div>
                <b>Commission:</b>
                <span style={{ color: '#ef4444', marginLeft: 6 }}>
                  -{Math.abs(pendingTrade.commission)}
                </span>
              </div>
              <div>
                <b>Spread:</b>
                <span style={{ color: '#ef4444', marginLeft: 6 }}>
                  -{Math.abs(pendingTrade.spread)}
                </span>
              </div>
              <div><b>Emotion:</b> {pendingTrade.emotion}</div>
              <div><b>Notes:</b> {pendingTrade.notes || <span style={{ color: '#a1a1aa' }}>None</span>}</div>
            </div>
            <div className="journal-form-actions">
              <button
                className="journal-btn cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="journal-btn submit"
                onClick={async () => {
                  try {
                    // Save to Supabase
                    const { error, data } = await supabase
                      .from('trades')
                      .insert([pendingTrade])
                      .select()
                      .single();

                    if (error) {
                      toast.error('Failed to save trade: ' + error.message);
                      return;
                    }

                    // Update account balance in Supabase
                    const newBalance = activeAccount.current_balance + pendingTrade.net_pnl;
                    const { error: updateError } = await supabase
                      .from('accounts')
                      .update({ current_balance: newBalance })
                      .eq('id', activeAccount.id);

                    if (updateError) {
                      toast.error('Failed to update account balance: ' + updateError.message);
                      return;
                    }

                    // Update store
                    addTrade(data);
                    updateAccount(activeAccount.id, { 
                      balance: newBalance,
                      current_balance: newBalance 
                    });

                    toast.success('Trade added successfully!');
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
                    
                    setShowConfirmModal(false);
                    setShowAddForm(false);
                    resetForm();
                    setFormData({
                      account_id: activeAccount.id, // Keep the active account
                      date: '',
                      currency_pair: '',
                      trade_type: '',
                      lot_size: '',
                      profit_loss: '',
                      commission: '',
                      spread: '',
                      emotion: 'Neutral',
                      notes: ''
                    });

                    // Update activeAccount state
                    setActiveAccount(prev => ({
                      ...prev,
                      current_balance: newBalance
                    }));
                    // Trigger refresh for other components
                    localStorage.setItem('tradesNeedsRefresh', Date.now().toString());
                  } catch (error) {
                    console.error('Error saving trade:', error);
                    toast.error('An unexpected error occurred while saving the trade');
                  }
                }}
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.5}
          colors={['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']}
        />
      )}
    </div>
  );
};

export default Journal;