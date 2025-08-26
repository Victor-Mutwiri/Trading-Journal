import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
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
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';
import useStore from '../useStore';
import '../styles/journal.css';

const Dashboard = () => {
  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSymbol, setFilterSymbol] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingTrade, setEditingTrade] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  
  // Get state and actions from Zustand store
  const {
    trades,
    setTrades,
    removeTrade,
    updateTrade,
    activeAccountId,
    isDataLoaded,
    setDataLoaded,
    resetDataLoaded,
    getTradeStats,
    getTradesForAccount,
    updateAccount
  } = useStore();

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

  const periodOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'semi', label: 'Semi-Annual' },
    { value: 'year', label: 'This Year' }
  ];

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

  // Fetch trades for the active account
  useEffect(() => {
    const fetchTrades = async () => {
      if (!activeAccountId) {
        setTrades([]);
        return;
      }

      if (!isDataLoaded.trades) {
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
          setDataLoaded('trades');
        }
      }
    };

    fetchTrades();
  }, [activeAccountId, isDataLoaded.trades, setTrades, setDataLoaded]);

  // Listen for storage events and active account changes
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'tradesNeedsRefresh') {
        resetDataLoaded('trades');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [resetDataLoaded]);

  // Reset trades data when active account changes
  useEffect(() => {
    resetDataLoaded('trades');
  }, [activeAccountId, resetDataLoaded]);

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
    try{

      // 1. Delete the trade from Supabase
      const { error: deleteError } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (deleteError) {
        toast.error('Failed to delete trade: ' + deleteError.message);
        return;
      }

      // 4. Update store
      removeTrade(id);

      // 5. Trigger refresh for Accounts component
      setDataLoaded({ ...isDataLoaded, accounts: false });
      localStorage.setItem('accountsNeedsRefresh', Date.now().toString());

      toast.success('Trade deleted successfully!');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      setShowTradeModal(false);
      setShowDeleteConfirm(false);
      setSelectedTrade(null);
    } catch (error) {
      console.error('Error deleting trade: ',  error);
      toast.error('An unexpected error occured');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.entryPrice || !formData.lotSize) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('trades')
        .update(formData)
        .eq('id', editingTrade.id);

      if (error) {
        toast.error('Failed to update trade: ' + error.message);
        return;
      }

      // Update in store
      updateTrade(editingTrade.id, formData);

      toast.success('Trade updated successfully!');
      setEditingTrade(null);
      setShowEditForm(false);
      resetForm();
    } catch (error) {
      toast.error('Error updating trade: ' + error.message);
    }
  };

  // Get current trades (filtered by active account)
  const currentTrades = activeAccountId ? getTradesForAccount(activeAccountId) : [];

  const getAvailableYears = () => {
    if (!currentTrades.length) return [new Date().getFullYear()];
    const years = currentTrades.map(trade => 
      new Date(trade.date).getFullYear()
    );
    return [...new Set(years)].sort((a, b) => b - a); // Sort descending
  };

  const filterTradesByPeriod = (trades, period, year) => {
    const now = new Date();
    const startOfYear = new Date(year, 0, 1);
    
    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const tradeYear = tradeDate.getFullYear();
      
      if (tradeYear !== year) return false;
      
      switch (period) {
        case 'week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return tradeDate >= startOfWeek;
          
        case 'month':
          return tradeDate.getMonth() === now.getMonth() &&
                tradeDate.getFullYear() === now.getFullYear();
          
        case 'quarter':
          const quarterStart = new Date(year, Math.floor(now.getMonth() / 3) * 3, 1);
          return tradeDate >= quarterStart;
          
        case 'semi':
          const semiStart = new Date(year, Math.floor(now.getMonth() / 6) * 6, 1);
          return tradeDate >= semiStart;
          
        case 'year':
          return tradeDate >= startOfYear;
          
        case 'all':
        default:
          return true;
      }
    });
  };

  const periodFilteredTrades = filterTradesByPeriod(currentTrades, selectedPeriod, selectedYear);

  // Filter and sort trades
  const filteredTrades = periodFilteredTrades
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

  // Calculate statistics based on filtered trades (including currency pair filter)
  const calculateStats = (trades) => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0
      };
    }

    const winningTrades = trades.filter(trade => trade.net_pnl > 0).length;
    const losingTrades = trades.filter(trade => trade.net_pnl < 0).length;
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.net_pnl || 0), 0);
    const winRate = trades.length > 0 ? ((winningTrades / trades.length) * 100).toFixed(1) : 0;

    return {
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      winRate: parseFloat(winRate),
      totalPnL
    };
  };

  // Helper function to generate stats label with currency pair filter
  const getStatsLabel = () => {
    const periodLabel = selectedPeriod === 'all' ? 'All Time' : 
      periodOptions.find(p => p.value === selectedPeriod)?.label;
    const pairLabel = filterSymbol === 'all' ? '' : ` - ${filterSymbol}`;
    return `Total Trades (${periodLabel} ${selectedYear}${pairLabel})`;
  };

  // Get statistics for the fully filtered trades (period + currency pair)
  const stats = calculateStats(filteredTrades);

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

        {/* No Account Selected State */}
        {!activeAccountId && (
          <div className="journal-empty" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FontAwesomeIcon icon={faChartLine} size="3x" style={{ color: '#6b7280', marginBottom: '16px' }} />
            <h3 style={{ color: '#e5e7eb', marginBottom: '8px' }}>No Active Account</h3>
            <p style={{ color: '#9ca3af' }}>Please select an active account from the Accounts page to view your trades.</p>
          </div>
        )}

        {/* Statistics Cards */}
        {activeAccountId && (
          <>
            <div className="journal-stats">
              <div className="journal-card">
                <div className="journal-card-row">
                  <div>
                    <p className="journal-card-label">
                      {getStatsLabel()}
                    </p>
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
                  <FontAwesomeIcon icon={faSearch} className="icon-gray" />
                  <input
                    type="text"
                    placeholder="Search trades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="journal-search-input"
                  />
                </div>
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
                <div className="journal-filter">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="journal-select"
                  >
                    {getAvailableYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="journal-filter">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="journal-select"
                  >
                    {periodOptions.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
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
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrades.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="journal-empty">
                          {currentTrades.length === 0 
                            ? "No trades found. Start trading to see your performance here!"
                            : "No trades match your current filters."
                          }
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
          </>
        )}

        {/* Trade Details Modal */}
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
                <div className="journal-modal-delete-confirm" style={{ marginTop: '20px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="delete-warning-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <FontAwesomeIcon 
                      icon={faExclamationTriangle} 
                      style={{ color: '#ef4444', marginRight: '12px', fontSize: '24px' }} 
                    />
                    <h3 style={{ color: '#ef4444', margin: 0 }}>Delete Trade</h3>
                  </div>
                  <div className="delete-warning-content" style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#fff', marginBottom: '12px' }}>
                      Are you sure you want to delete this trade? This action:
                    </p>
                    <ul style={{ color: '#fff', paddingLeft: '20px' }}>
                      <li>Cannot be undone</li>
                      <li>Will remove the trade from your history</li>
                      <li>Will adjust your account balance</li>
                      <li>Will update your trading statistics</li>
                    </ul>
                  </div>
                  <div className="journal-form-actions">
                    <button
                      className="journal-btn cancel"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="journal-btn submit"
                      style={{ 
                        background: '#ef4444', 
                        color: '#fff',
                        borderColor: '#ef4444'
                      }}
                      onClick={() => {
                        handleDelete(selectedTrade.id)
                      }
                      }
                    >
                      Yes, Delete Trade
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Edit Form Modal */}
        {/* {showEditForm && editingTrade && (
          <div className="journal-modal-overlay">
            <div className="journal-modal">
              <div className="journal-modal-header">
                <h2 className="journal-modal-title">Edit Trade</h2>
                <button
                  className="journal-modal-close"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingTrade(null);
                    resetForm();
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} style={{ color: '#fff' }}>
                <div style={{ marginBottom: 16 }}>
                  <label>Currency Pair *</label>
                  <select
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="journal-input"
                    required
                  >
                    <option value="">Select pair</option>
                    {currencyPairs.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label>Entry Price *</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.entryPrice}
                      onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                      className="journal-input"
                      required
                    />
                  </div>
                  <div>
                    <label>Exit Price</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.exitPrice}
                      onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                      className="journal-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label>Lot Size *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.lotSize}
                      onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                      className="journal-input"
                      required
                    />
                  </div>
                  <div>
                    <label>Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="journal-input"
                    >
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </div>
                </div>

                <div className="journal-form-actions">
                  <button
                    type="button"
                    className="journal-btn cancel"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingTrade(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="journal-btn submit">
                    Update Trade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )} */}
      </div>
      {showConfetti && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={700}
            gravity={0.7}
            colors={['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']}
          />
        )}
    </div>
  );
};

export default Dashboard;