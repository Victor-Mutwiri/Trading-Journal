import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // State
      accounts: [],
      activeAccountId: null,
      trades: [],
      isDataLoaded: {
        accounts: false,
        trades: false
      },
      userData: null,
      userDataLoaded: false,
      
      // Account Actions
      setAccounts: (accounts) => set({ accounts }),
      
      setActiveAccountId: (id) => {
        set({ activeAccountId: id });
        localStorage.setItem('activeAccountId', id);
      },

      setUserData: (data) => set({ 
        userData: data,
        userDataLoaded: true 
      }),
      
      // Modified addAccount to handle active account
      addAccount: (account) => set((state) => {
        const newAccounts = [...state.accounts, account];
        // If this is the first account or no active account, set it as active
        if (newAccounts.length === 1 || !state.activeAccountId) {
          localStorage.setItem('activeAccountId', account.id);
          return {
            accounts: newAccounts,
            activeAccountId: account.id
          };
        }
        return { accounts: newAccounts };
      }),
      
      updateAccount: (accountId, updates) => set((state) => ({
        accounts: state.accounts.map(account => 
          account.id === accountId 
            ? { ...account, ...updates } 
            : account
        )
      })),
      
      removeAccount: (accountId) => set((state) => {
        const updatedAccounts = state.accounts.filter(account => account.id !== accountId);
        return {
          accounts: updatedAccounts,
          // If deleted account was active, set new active account or null
          activeAccountId: state.activeAccountId === accountId 
            ? (updatedAccounts.length > 0 ? updatedAccounts[0].id : null)
            : state.activeAccountId
        };
      }),
      
      // Trade Actions
      setTrades: (trades) => set({ trades }),
      
      addTrade: (trade) => set((state) => ({
        trades: [trade, ...state.trades]
      })),
      
      updateTrade: (tradeId, updates) => set((state) => ({
        trades: state.trades.map(trade => 
          trade.id === tradeId ? { ...trade, ...updates } : trade
        )
      })),
      
      removeTrade: (tradeId) => set((state) => ({
        trades: state.trades.filter(trade => trade.id !== tradeId)
      })),
      
      // Get trades for specific account
      getTradesForAccount: (accountId) => {
        const state = get();
        return state.trades.filter(trade => trade.account_id === accountId);
      },
      
      // Data Loading Actions
      setDataLoaded: (key) => set((state) => ({
        isDataLoaded: {
          ...state.isDataLoaded,
          [key]: true
        }
      })),
      
      resetDataLoaded: (key) => {
        if (key) {
          set((state) => ({
            isDataLoaded: {
              ...state.isDataLoaded,
              [key]: false
            }
          }));
        } else {
          set({
            isDataLoaded: {
              accounts: false,
              trades: false
            }
          });
        }
      },
      
      // Helper Actions
      getAccountById: (accountId) => {
        const state = get();
        return state.accounts.find(account => account.id === accountId);
      },
      
      getTradeById: (tradeId) => {
        const state = get();
        return state.trades.find(trade => trade.id === tradeId);
      },
      
      // Statistics helpers
      getTradeStats: (accountId = null) => {
        const state = get();
        const trades = accountId 
          ? state.trades.filter(trade => trade.account_id === accountId)
          : state.trades;
        
        const totalTrades = trades.length;
        const winningTrades = trades.filter(trade => (trade.net_pnl || 0) > 0).length;
        const losingTrades = trades.filter(trade => (trade.net_pnl || 0) < 0).length;
        const totalPnL = trades.reduce((sum, trade) => sum + (trade.net_pnl || 0), 0);
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;
        
        return {
          totalTrades,
          winningTrades,
          losingTrades,
          totalPnL,
          winRate: parseFloat(winRate.toFixed(1))
        };
      },

      resetStore: () => {
        set({
          accounts: [],
          activeAccountId: null,
          trades: [],
          isDataLoaded: {
            accounts: false,
            trades: false
          },
          userData: null,
          userDataLoaded: false,
        }),
        localStorage.removeItem('trading-journal-storage')
      }
    }),
    {
      name: 'trading-journal-storage',
      partialize: (state) => ({
        accounts: state.accounts,
        activeAccountId: state.activeAccountId,
        trades: state.trades,
        userData: state.userData,
        userDataLoaded: state.userDataLoaded,
      })
    }
  )
);

export default useStore;