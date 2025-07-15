import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTimes,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import '../styles/journal.css';

const Journal = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.entryPrice || !formData.lotSize) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTrade = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    // TODO: Save to Supabase database
    console.log('New trade to save:', newTrade);
    
    toast.success('Trade added successfully!');
    resetForm();
    setShowAddForm(false);
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
              <h1 className="journal-title">Trading Journal</h1>
              <p className="journal-subtitle">Record your trades and track your progress</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
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
                onClick={() => setShowAddForm(true)}
                className="journal-add-btn"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Your First Trade</span>
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

              <form onSubmit={handleSubmit} className="journal-form">
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
                      placeholder="0.00000"
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
                      placeholder="0.00000"
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
                      placeholder="0.00"
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
                      setShowAddForm(false);
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
                    Add Trade
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;