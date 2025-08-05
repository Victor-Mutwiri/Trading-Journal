import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faChartLine,
  faSearch,
  faFilter,
  faArrowUp,
  faArrowDown,
  faTimes,
  faEdit,
  faTrash,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import '../styles/journal.css';

const Dashboard = () => {
  const [trades, setTrades] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSymbol, setFilterSymbol] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingTrade, setEditingTrade] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'buy',
    entryPrice: '',
    exitPrice: '',
    lotSize: '',
    entryDate: '',
    exitDate: '',
    notes: '',
    strategy: '',
    riskReward: '',
    emotion: 'neutral'
  });

  const currencyPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
    'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'CHF/JPY', 'EUR/CHF',
    'AUD/JPY', 'GBP/CHF', 'CAD/JPY', 'NZD/JPY', 'AUD/CHF', 'AUD/CAD'
  ];

  // 1. Fetch trades for the active account
  useEffect(() => {
    const fetchTrades = async () => {
      const activeAccountId = localStorage.getItem('activeAccountId');
      if (!activeAccountId) {
        setTrades([]);
        return;
      }
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('account_id', activeAccountId)
        .order('date', { ascending: false });
      if (error) {
        toast.error('Failed to fetch trades: ' + error.message);
        setTrades([]);
      } else {
        setTrades(data || []);
      }
    };
    fetchTrades();
  }, []);

  const strategies = [
    'Scalping', 'Day Trading', 'Swing Trading', 'Position Trading',
    'Trend Following', 'Range Trading', 'Breakout', 'News Trading',
    'Carry Trade', 'Arbitrage', 'Support/Resistance', 'Moving Average'
  ];

  const emotions = [
    { value: 'confident', label: 'Confident', color: '#22c55e' },
    { value: 'neutral', label: 'Neutral', color: '#6b7280' },
    { value: 'anxious', label: 'Anxious', color: '#f59e0b' },
    { value: 'greedy', label: 'Greedy', color: '#ef4444' },
    { value: 'fearful', label: 'Fearful', color: '#8b5cf6' }
  ];

  // Calculate P&L for a trade
  const calculatePnL = (trade) => {
    const entry = parseFloat(trade.entryPrice);
    const exit = parseFloat(trade.exitPrice);
    const lots = parseFloat(trade.lotSize);
    
    if (!entry || !exit || !lots) return 0;
    
    const pipValue = 10; // Standard pip value for major pairs
    let pips = 0;
    
    if (trade.type === 'buy') {
      pips = (exit - entry) * 10000;
    } else {
      pips = (entry - exit) * 10000;
    }
    
    return pips * lots * pipValue;
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      type: 'buy',
      entryPrice: '',
      exitPrice: '',
      lotSize: '',
      entryDate: '',
      exitDate: '',
      notes: '',
      strategy: '',
      riskReward: '',
      emotion: 'neutral'
    });
  };

  const handleEdit = (trade) => {
    setFormData(trade);
    setEditingTrade(trade);
    setShowEditForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trade?')) return;

    // 1. Get the trade to delete
    const { data: tradeToDelete, error: fetchError } = await supabase
      .from('trades')
      .select('net_pnl, account_id')
      .eq('id', id)
      .single();
    if (fetchError) {
      toast.error('Failed to fetch trade: ' + fetchError.message);
      return;
    }

    // 2. Delete the trade
    const { error: deleteError } = await supabase.from('trades').delete().eq('id', id);
    if (deleteError) {
      toast.error('Failed to delete trade: ' + deleteError.message);
      return;
    }

    // 3. Get the current account balance
    const { data: account, error: accError } = await supabase
      .from('accounts')
      .select('current_balance')
      .eq('id', tradeToDelete.account_id)
      .single();
    if (accError) {
      toast.error('Failed to fetch account: ' + accError.message);
      return;
    }

    // 4. Update the account balance
    await supabase
      .from('accounts')
      .update({ current_balance: account.current_balance - tradeToDelete.net_pnl })
      .eq('id', tradeToDelete.account_id);

    // 5. Trigger refresh for Accounts component
    localStorage.setItem('accountsNeedsRefresh', Date.now());

    // 6. Update local state/UI
    setTrades(trades.filter(trade => trade.id !== id));
    toast.success('Trade deleted successfully!');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.entryPrice || !formData.lotSize) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedTrade = {
      ...editingTrade,
      ...formData
    };

    setTrades(trades.map(trade => trade.id === editingTrade.id ? updatedTrade : trade));
    toast.success('Trade updated successfully!');
    setEditingTrade(null);
    setShowEditForm(false);
    resetForm();
  };

  // Filter and sort trades
  const filteredTrades = trades
    .filter(trade => {
      const matchesSearch = trade.currency_pair?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.strategy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterSymbol === 'all' || trade.currency_pair === filterSymbol;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'pnl':
          aValue = a.net_pnl;
          bValue = b.net_pnl;
          break;
        case 'symbol':
          aValue = a.currency_pair;
          bValue = b.currency_pair;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate statistics
  const stats = {
    totalTrades: trades.length,
    winningTrades: trades.filter(trade => trade.net_pnl > 0).length,
    losingTrades: trades.filter(trade => trade.net_pnl < 0).length,
    totalPnL: trades.reduce((sum, trade) => sum + (trade.net_pnl || 0), 0),
    winRate: trades.length > 0 ? (trades.filter(trade => trade.net_pnl > 0).length / trades.length * 100).toFixed(1) : 0
  };

  

  return (
    <div className="journal-root">
      <div className="journal-container">
        {/* Header */}
        <div className="journal-header">
          <div className="journal-header-left">
            <div className="journal-header-icon">
              <FontAwesomeIcon icon={faChartLine} className="icon-lg" />
            </div>
            <div>
              <h1 className="journal-title">Trading Dashboard</h1>
              <p className="journal-subtitle">Monitor your trading performance and manage trades</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="journal-stats">
          <div className="journal-card">
            <div className="journal-card-row">
              <div>
                <p className="journal-card-label">Total Trades</p>
                <p className="journal-card-value">{stats.totalTrades}</p>
              </div>
              <FontAwesomeIcon icon={faChartLine} className="icon-blue" />
            </div>
          </div>
          <div className="journal-card">
            <div className="journal-card-row">
              <div>
                <p className="journal-card-label">Win Rate</p>
                <p className="journal-card-value win">{stats.winRate}%</p>
              </div>
              <FontAwesomeIcon icon={faArrowUp} className="icon-green" />
            </div>
          </div>
          <div className="journal-card">
            <div className="journal-card-row">
              <div>
                <p className="journal-card-label">Winning Trades</p>
                <p className="journal-card-value win">{stats.winningTrades}</p>
              </div>
              <FontAwesomeIcon icon={faArrowUp} className="icon-green" />
            </div>
          </div>
          <div className="journal-card">
            <div className="journal-card-row">
              <div>
                <p className="journal-card-label">Losing Trades</p>
                <p className="journal-card-value lose">{stats.losingTrades}</p>
              </div>
              <FontAwesomeIcon icon={faArrowDown} className="icon-red" />
            </div>
          </div>
          <div className="journal-card">
            <div className="journal-card-row">
              <div>
                <p className="journal-card-label">Total P&L</p>
                <p className={`journal-card-value ${stats.totalPnL >= 0 ? 'win' : 'lose'}`}>
                  ${stats.totalPnL.toFixed(2)}
                </p>
              </div>
              <FontAwesomeIcon icon={faDollarSign} className={`icon-lg ${stats.totalPnL >= 0 ? 'icon-green' : 'icon-red'}`} />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="journal-filters">
          <div className="journal-filters-row">
            <div className="journal-filter">
              <FontAwesomeIcon icon={faFilter} className="icon-gray" />
              <select
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                className="journal-select"
              >
                <option value="all">All Pairs</option>
                {currencyPairs.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
            </div>
            <div className="journal-sort">
              <span className="journal-sort-label">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="journal-select"
              >
                <option value="date">Date</option>
                <option value="symbol">Symbol</option>
                <option value="pnl">P&L</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="journal-sort-btn"
              >
                <FontAwesomeIcon icon={sortOrder === 'asc' ? faArrowUp : faArrowDown} />
              </button>
            </div>
          </div>
        </div>

        {/* Trades List */}
        <div className="journal-trades">
          <div className="journal-trades-header">
            <h2 className="journal-trades-title">All Trades</h2>
          </div>
          <div className="journal-trades-table-wrapper">
            <table className="journal-trades-table">
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>Type</th>
                  <th>Lot Size</th>
                  <th>P&L</th>
                  <th>Commission</th>
                  <th>Spread</th>
                  <th>Emotion</th>
                  <th>Date</th>
                  {/* <th>Notes</th> */}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="journal-empty">
                      No trades found. Start trading to see your performance here!
                    </td>
                  </tr>
                ) : (
                  filteredTrades.map((trade) => (
                    <tr key={trade.id} className="journal-trade-row">
                      <td>{trade.currency_pair}</td>
                      <td>
                        <span className={`journal-type ${trade.trade_type === 'Buy' ? 'type-buy' : 'type-sell'}`}>
                          {trade.trade_type}
                        </span>
                      </td>
                      <td>{trade.lot_size}</td>
                      <td>
                        <span className={`journal-pnl ${trade.net_pnl >= 0 ? 'win' : 'lose'}`}>
                          ${trade.net_pnl?.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#ef4444' }}>
                          -{Math.abs(trade.commission || 0)}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#ef4444' }}>
                          -{Math.abs(trade.spread || 0)}
                        </span>
                      </td>
                      <td>{trade.emotion}</td>
                      <td className="journal-date">
                        {trade.date ? new Date(trade.date).toLocaleDateString() : 'N/A'}
                      </td>
                      {/* <td>{trade.notes || '-'}</td> */}
                      <td>
                        <button
                          className="journal-more-btn"
                          onClick={() => {
                            setSelectedTrade(trade);
                            setShowTradeModal(true);
                            setShowDeleteConfirm(false);
                          }}
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showTradeModal && selectedTrade && (
          <div className="journal-modal-overlay">
            <div className="journal-modal">
              <div className="journal-modal-header">
                <h2 className="journal-modal-title">Trade Details</h2>
                <button
                  className="journal-modal-close"
                  onClick={() => setShowTradeModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div style={{ marginBottom: 24, textAlign: 'left', color: '#fff' }}>
                <div><b>Date:</b> {selectedTrade.date ? new Date(selectedTrade.date).toLocaleString() : 'N/A'}</div>
                <div><b>Pair:</b> {selectedTrade.currency_pair}</div>
                <div><b>Trade Type:</b> {selectedTrade.trade_type}</div>
                <div>
                  <b>{selectedTrade.profit_loss >= 0 ? 'Profit' : 'Loss'}:</b>
                  <span style={{ color: selectedTrade.profit_loss >= 0 ? '#22c55e' : '#ef4444', marginLeft: 6 }}>
                    {selectedTrade.profit_loss >= 0 ? '+' : '-'}{Math.abs(selectedTrade.profit_loss)}
                  </span>
                </div>
                <div><b>Lot Size:</b> {selectedTrade.lot_size}</div>
                <div>
                  <b>Commission:</b>
                  <span style={{ color: '#ef4444', marginLeft: 6 }}>
                    -{Math.abs(selectedTrade.commission)}
                  </span>
                </div>
                <div>
                  <b>Spread:</b>
                  <span style={{ color: '#ef4444', marginLeft: 6 }}>
                    -{Math.abs(selectedTrade.spread)}
                  </span>
                </div>
                <div><b>Emotion:</b> {selectedTrade.emotion}</div>
                <div><b>Notes:</b> {selectedTrade.notes || <span style={{ color: '#a1a1aa' }}>None</span>}</div>
              </div>
              <div className="journal-form-actions">
                <button
                  className="journal-btn cancel"
                  onClick={() => setShowTradeModal(false)}
                >
                  Close
                </button>
                <button
                  className="journal-btn submit"
                  style={{ background: '#ef4444', color: '#fff' }}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </button>
              </div>
              {showDeleteConfirm && (
                <div className="journal-modal-delete-confirm">
                  <p style={{ color: '#ef4444', margin: '16px 0' }}>
                    Are you sure you want to delete this trade entry? This action cannot be undone.
                  </p>
                  <div className="journal-form-actions">
                    <button
                      className="journal-btn cancel"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="journal-btn submit"
                      style={{ background: '#ef4444', color: '#fff' }}
                      onClick={async () => {
                        await handleDelete(selectedTrade.id);
                        setShowTradeModal(false);
                        setSelectedTrade(null);
                        setShowDeleteConfirm(false);
                      }}
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Trade Modal */}
        {/* {showEditForm && (
          <div className="journal-modal-overlay">
            <div className="journal-modal">
              <div className="journal-modal-header">
                <h2 className="journal-modal-title">Edit Trade</h2>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingTrade(null);
                    resetForm();
                  }}
                  className="journal-modal-close"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="journal-form">
                <div className="journal-form-grid">
                  <div>
                    <label className="journal-label">
                      Currency Pair *
                    </label>
                    <select
                      value={formData.symbol}
                      onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                      required
                      className="journal-input"
                    >
                      <option value="">Select pair</option>
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
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="journal-input"
                    >
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </div>

                  <div>
                    <label className="journal-label">
                      Entry Price *
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.entryPrice}
                      onChange={(e) => setFormData({...formData, entryPrice: e.target.value})}
                      required
                      className="journal-input"
                    />
                  </div>

                  <div>
                    <label className="journal-label">
                      Exit Price
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.exitPrice}
                      onChange={(e) => setFormData({...formData, exitPrice: e.target.value})}
                      className="journal-input"
                    />
                  </div>

                  <div>
                    <label className="journal-label">
                      Lot Size *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.lotSize}
                      onChange={(e) => setFormData({...formData, lotSize: e.target.value})}
                      required
                      className="journal-input"
                    />
                  </div>

                  <div>
                    <label className="journal-label">
                      Strategy
                    </label>
                    <select
                      value={formData.strategy}
                      onChange={(e) => setFormData({...formData, strategy: e.target.value})}
                      className="journal-input"
                    >
                      <option value="">Select strategy</option>
                      {strategies.map(strategy => (
                        <option key={strategy} value={strategy}>{strategy}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="journal-label">
                      Entry Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.entryDate}
                      onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
                      className="journal-input"
                    />
                  </div>

                  <div>
                    <label className="journal-label">
                      Exit Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.exitDate}
                      onChange={(e) => setFormData({...formData, exitDate: e.target.value})}
                      className="journal-input"
                    />
                  </div>

                  <div>
                    <label className="journal-label">
                      Risk/Reward Ratio
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 1:2"
                      value={formData.riskReward}
                      onChange={(e) => setFormData({...formData, riskReward: e.target.value})}
                      className="journal-input"
                    />
                  </div>

                  <div>
                    <label className="journal-label">
                      Emotion
                    </label>
                    <select
                      value={formData.emotion}
                      onChange={(e) => setFormData({...formData, emotion: e.target.value})}
                      className="journal-input"
                    >
                      {emotions.map(emotion => (
                        <option key={emotion.value} value={emotion.value}>
                          {emotion.label}
                        </option>
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
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={4}
                    className="journal-input"
                    placeholder="Add any additional notes about this trade..."
                  />
                </div>

                <div className="journal-form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingTrade(null);
                      resetForm();
                    }}
                    className="journal-btn cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="journal-btn submit"
                  >
                    Update Trade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Dashboard;