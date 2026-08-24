import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { budgetService } from '../services/budgetService';
import { goalService } from '../services/goalService';
import { analyticsService } from '../services/analyticsService';
import { notificationService } from '../services/notificationService';
import {
  calculateCategoryDistribution,
  calculateMonthlyEvolution,
  calculateBudgetUsage,
} from '../utils/calculations';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState('month'); // 'month', '3months', 'year'

  // Fetch all financial data from backend API
  const refreshFinancialData = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setCategories([]);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setNotifications([]);
      setFinancialSummary(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [accs, cats, txs, bdgs, gls, notifs, summary] = await Promise.all([
        accountService.getAccounts().catch(() => []),
        categoryService.getCategories().catch(() => []),
        transactionService.getTransactions().catch(() => []),
        budgetService.getBudgets().catch(() => []),
        goalService.getGoals().catch(() => []),
        notificationService.getNotifications().catch(() => []),
        analyticsService.getSummary(period).catch(() => null),
      ]);

      setAccounts(accs || []);
      setCategories(cats || []);
      setTransactions(txs || []);
      setBudgets(bdgs || []);
      setGoals(gls || []);
      setNotifications(notifs || []);
      setFinancialSummary(summary);
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError(err.message || 'Error al sincronizar datos');
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useEffect(() => {
    refreshFinancialData();
  }, [refreshFinancialData]);

  // Actions with backend synchronization
  const addTransaction = async (data) => {
    const created = await transactionService.createTransaction(data);
    await refreshFinancialData();
    return created;
  };

  const updateTransaction = async (id, updates) => {
    const updated = await transactionService.updateTransaction(id, updates);
    await refreshFinancialData();
    return updated;
  };

  const deleteTransaction = async (id) => {
    await transactionService.deleteTransaction(id);
    await refreshFinancialData();
  };

  const transferFunds = async (transferData) => {
    const res = await accountService.transferFunds(transferData);
    await refreshFinancialData();
    return res;
  };

  const addAccount = async (data) => {
    const created = await accountService.createAccount(data);
    await refreshFinancialData();
    return created;
  };

  const updateAccount = async (id, updates) => {
    const updated = await accountService.updateAccount(id, updates);
    await refreshFinancialData();
    return updated;
  };

  const deleteAccount = async (id) => {
    await accountService.deleteAccount(id);
    await refreshFinancialData();
  };

  const addCategory = async (data) => {
    const created = await categoryService.createCategory(data);
    await refreshFinancialData();
    return created;
  };

  const updateCategory = async (id, updates) => {
    const updated = await categoryService.updateCategory(id, updates);
    await refreshFinancialData();
    return updated;
  };

  const deleteCategory = async (id) => {
    await categoryService.deleteCategory(id);
    await refreshFinancialData();
  };

  const addBudget = async (data) => {
    const created = await budgetService.createBudget(data);
    await refreshFinancialData();
    return created;
  };

  const updateBudget = async (id, updates) => {
    const updated = await budgetService.updateBudget(id, updates);
    await refreshFinancialData();
    return updated;
  };

  const deleteBudget = async (id) => {
    await budgetService.deleteBudget(id);
    await refreshFinancialData();
  };

  const addGoal = async (data) => {
    const created = await goalService.createGoal(data);
    await refreshFinancialData();
    return created;
  };

  const updateGoal = async (id, updates) => {
    const updated = await goalService.updateGoal(id, updates);
    await refreshFinancialData();
    return updated;
  };

  const deleteGoal = async (id) => {
    await goalService.deleteGoal(id);
    await refreshFinancialData();
  };

  const addGoalContribution = async (goalId, data) => {
    const res = await goalService.addContribution(goalId, data);
    await refreshFinancialData();
    return res;
  };

  const markNotificationRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const exportCSV = async (filters = {}) => {
    return await transactionService.exportCSV(filters);
  };

  // Calculated values & series
  const totalBalance = financialSummary?.totalBalance ?? accounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  const income = financialSummary?.income ?? 0;
  const expenses = financialSummary?.expenses ?? 0;
  const netSavings = financialSummary?.netSavings ?? (income - expenses);
  const savingsRate = financialSummary?.savingsRate ?? 0;
  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  const monthlyEvolution6 = useMemo(() => {
    return calculateMonthlyEvolution(transactions, 6);
  }, [transactions]);

  const monthlyEvolution12 = useMemo(() => {
    return calculateMonthlyEvolution(transactions, 12);
  }, [transactions]);

  const categoryDistribution = useMemo(() => {
    return calculateCategoryDistribution(transactions, categories);
  }, [transactions, categories]);

  const activeBudget = budgets[0] || null;
  const budgetUsage = useMemo(() => {
    if (!activeBudget) return null;
    return calculateBudgetUsage(activeBudget, activeBudget.budget_categories || [], transactions);
  }, [activeBudget, transactions]);

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        categories,
        transactions,
        budgets,
        goals,
        notifications,
        unreadNotificationsCount,
        financialSummary,
        totalBalance,
        income,
        expenses,
        netSavings,
        savingsRate,
        period,
        setPeriod,
        loading,
        error,
        monthlyEvolution6,
        monthlyEvolution12,
        categoryDistribution,
        budgetUsage,
        activeBudget,
        refreshFinancialData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        transferFunds,
        addAccount,
        updateAccount,
        deleteAccount,
        removeAccount: deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        removeCategory: deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        removeBudget: deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        removeGoal: deleteGoal,
        addGoalContribution,
        markNotificationRead,
        markAllNotificationsRead,
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
