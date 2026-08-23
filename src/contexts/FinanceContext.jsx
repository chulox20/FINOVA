import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { budgetService } from '../services/budgetService';
import { goalService } from '../services/goalService';
import { notificationService } from '../services/notificationService';
import {
  calculateTotalNetWorth,
  calculateFinancialSummary,
  calculatePercentageChange,
  calculateCategoryDistribution,
  calculateMonthlyEvolution,
  calculateBudgetUsage,
  filterTransactionsByDate,
} from '../utils/calculations';
import { formatCurrency, formatPercentage } from '../utils/currency';
import { getPeriodRange } from '../utils/date';
import { exportTransactionsToCSV } from '../utils/export';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const { user, profile } = useAuth();
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('this_month'); // 'this_month' | 'last_3_months' | 'this_year'

  const currency = profile?.currency || 'USD';

  // Load all user financial data
  const loadFinanceData = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setTransactions([]);
      setCategories([]);
      setBudgets([]);
      setGoals([]);
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [accs, txs, cats, buds, gols, notifs] = await Promise.all([
        accountService.getAccounts(user.id),
        transactionService.getTransactions(user.id),
        categoryService.getCategories(user.id),
        budgetService.getBudgets(user.id),
        goalService.getGoals(user.id),
        notificationService.getNotifications(user.id),
      ]);

      setAccounts(accs);
      setTransactions(txs);
      setCategories(cats);
      setBudgets(buds);
      setGoals(gols);
      setNotifications(notifs);
    } catch (err) {
      console.error('Error loading finance data:', err);
      setError(err.message || 'Error al cargar los datos financieros');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  // Total Net Worth (Total Balance)
  const totalNetWorth = useMemo(() => {
    return calculateTotalNetWorth(accounts);
  }, [accounts]);

  // Current Month Summary
  const currentMonthRange = useMemo(() => getPeriodRange('this_month'), []);
  const previousMonthRange = useMemo(() => getPeriodRange('last_month'), []);

  const currentMonthTransactions = useMemo(() => {
    return filterTransactionsByDate(transactions, currentMonthRange.startDate, currentMonthRange.endDate);
  }, [transactions, currentMonthRange]);

  const previousMonthTransactions = useMemo(() => {
    return filterTransactionsByDate(transactions, previousMonthRange.startDate, previousMonthRange.endDate);
  }, [transactions, previousMonthRange]);

  const currentMonthSummary = useMemo(() => {
    return calculateFinancialSummary(currentMonthTransactions);
  }, [currentMonthTransactions]);

  const previousMonthSummary = useMemo(() => {
    return calculateFinancialSummary(previousMonthTransactions);
  }, [previousMonthTransactions]);

  // Trend comparisons (KPIs)
  const kpiTrends = useMemo(() => {
    const incomeTrend = calculatePercentageChange(currentMonthSummary.income, previousMonthSummary.income);
    const expenseTrend = calculatePercentageChange(currentMonthSummary.expense, previousMonthSummary.expense);
    const savingsTrend = calculatePercentageChange(currentMonthSummary.savings, previousMonthSummary.savings);

    return {
      incomeTrend,
      expenseTrend,
      savingsTrend,
    };
  }, [currentMonthSummary, previousMonthSummary]);

  // Period-filtered transactions for dynamic dashboard viewing
  const periodTransactions = useMemo(() => {
    const range = getPeriodRange(selectedPeriod);
    return filterTransactionsByDate(transactions, range.startDate, range.endDate);
  }, [transactions, selectedPeriod]);

  const periodSummary = useMemo(() => {
    return calculateFinancialSummary(periodTransactions);
  }, [periodTransactions]);

  // Chart data: 6-month & 12-month evolution
  const monthlyEvolution6 = useMemo(() => {
    return calculateMonthlyEvolution(transactions, 6);
  }, [transactions]);

  const monthlyEvolution12 = useMemo(() => {
    return calculateMonthlyEvolution(transactions, 12);
  }, [transactions]);

  // Category distribution for pie / donut charts
  const categoryDistribution = useMemo(() => {
    return calculateCategoryDistribution(periodTransactions, categories);
  }, [periodTransactions, categories]);

  // Current Active Budget and Alerts
  const currentBudget = useMemo(() => {
    return budgets[0] || null;
  }, [budgets]);

  const budgetUsage = useMemo(() => {
    if (!currentBudget) return null;
    return calculateBudgetUsage(currentBudget, currentBudget.budget_categories || [], transactions);
  }, [currentBudget, transactions]);

  // Recent transactions (last 6)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 6);
  }, [transactions]);

  // Unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  // Currency Formatter shorthand bound to current profile currency
  const formatMoney = useCallback((amount, options = {}) => {
    return formatCurrency(amount, currency, options);
  }, [currency]);

  // ============================================================================
  // MUTATION ACTIONS
  // ============================================================================

  // Transaction Actions
  const addTransaction = async (data) => {
    const created = await transactionService.createTransaction({
      ...data,
      user_id: user.id,
    });
    await loadFinanceData();
    return created;
  };

  const editTransaction = async (id, updates) => {
    const updated = await transactionService.updateTransaction(id, updates);
    await loadFinanceData();
    return updated;
  };

  const removeTransaction = async (id) => {
    await transactionService.deleteTransaction(id);
    await loadFinanceData();
  };

  // Account Actions
  const addAccount = async (data) => {
    const created = await accountService.createAccount({
      ...data,
      user_id: user.id,
      currency: data.currency || currency,
    });
    await loadFinanceData();
    return created;
  };

  const editAccount = async (id, updates) => {
    const updated = await accountService.updateAccount(id, updates);
    await loadFinanceData();
    return updated;
  };

  const removeAccount = async (id) => {
    await accountService.deleteAccount(id);
    await loadFinanceData();
  };

  const transferMoney = async (transferData) => {
    const res = await accountService.transferFunds({
      ...transferData,
      userId: user.id,
    });
    await loadFinanceData();
    return res;
  };

  // Category Actions
  const addCategory = async (data) => {
    const created = await categoryService.createCategory({
      ...data,
      user_id: user.id,
    });
    await loadFinanceData();
    return created;
  };

  const editCategory = async (id, updates) => {
    const updated = await categoryService.updateCategory(id, updates);
    await loadFinanceData();
    return updated;
  };

  const removeCategory = async (id) => {
    await categoryService.deleteCategory(id);
    await loadFinanceData();
  };

  // Budget Actions
  const addBudget = async (budgetData, categoryLimits) => {
    const created = await budgetService.createBudget({
      ...budgetData,
      user_id: user.id,
    }, categoryLimits);
    await loadFinanceData();
    return created;
  };

  const editBudget = async (id, budgetData, categoryLimits) => {
    const updated = await budgetService.updateBudget(id, budgetData, categoryLimits);
    await loadFinanceData();
    return updated;
  };

  const removeBudget = async (id) => {
    await budgetService.deleteBudget(id);
    await loadFinanceData();
  };

  // Goal Actions
  const addGoal = async (data) => {
    const created = await goalService.createGoal({
      ...data,
      user_id: user.id,
    });
    await loadFinanceData();
    return created;
  };

  const editGoal = async (id, updates) => {
    const updated = await goalService.updateGoal(id, updates);
    await loadFinanceData();
    return updated;
  };

  const removeGoal = async (id) => {
    await goalService.deleteGoal(id);
    await loadFinanceData();
  };

  const contributeGoal = async (contributionData) => {
    const res = await goalService.addContribution({
      ...contributionData,
      userId: user.id,
    });
    await loadFinanceData();
    return res;
  };

  // Notification Actions
  const markNotificationRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    if (user) {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const removeNotification = async (id) => {
    await notificationService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Export CSV
  const exportCSV = (filteredTxList = null) => {
    const listToExport = filteredTxList || transactions;
    exportTransactionsToCSV(listToExport, `finova-movimientos-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <FinanceContext.Provider
      value={{
        // State
        accounts,
        transactions,
        categories,
        budgets,
        goals,
        notifications,
        loading,
        error,
        currency,
        selectedPeriod,
        setSelectedPeriod,

        // Calculated metrics
        totalNetWorth,
        currentMonthSummary,
        previousMonthSummary,
        periodSummary,
        kpiTrends,
        monthlyEvolution6,
        monthlyEvolution12,
        categoryDistribution,
        currentBudget,
        budgetUsage,
        recentTransactions,
        unreadNotificationsCount,
        formatMoney,
        formatPercentage,

        // Actions
        loadFinanceData,
        addTransaction,
        editTransaction,
        removeTransaction,
        addAccount,
        editAccount,
        removeAccount,
        transferMoney,
        addCategory,
        editCategory,
        removeCategory,
        addBudget,
        editBudget,
        removeBudget,
        addGoal,
        editGoal,
        removeGoal,
        contributeGoal,
        markNotificationRead,
        markAllNotificationsRead,
        removeNotification,
        exportCSV,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
}
