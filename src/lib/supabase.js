import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_USER,
  INITIAL_ADMIN,
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_BUDGET_CATEGORIES,
  INITIAL_GOALS,
  INITIAL_GOAL_CONTRIBUTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ADMIN_METRICS,
} from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// LOCAL STORAGE DEMO REPOSITORY
// Implements full local fallback storage for seamless offline / demo usage
// ==============================================================================
const STORAGE_KEYS = {
  USER: 'finova_demo_user',
  ACCOUNTS: 'finova_demo_accounts',
  CATEGORIES: 'finova_demo_categories',
  TRANSACTIONS: 'finova_demo_transactions',
  BUDGETS: 'finova_demo_budgets',
  BUDGET_CATEGORIES: 'finova_demo_budget_categories',
  GOALS: 'finova_demo_goals',
  GOAL_CONTRIBUTIONS: 'finova_demo_goal_contributions',
  NOTIFICATIONS: 'finova_demo_notifications',
};

function getStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

// Initialize local mock store if empty
export function initLocalStore() {
  if (!getStorage(STORAGE_KEYS.ACCOUNTS, null)) {
    setStorage(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
  }
  if (!getStorage(STORAGE_KEYS.CATEGORIES, null)) {
    setStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
  if (!getStorage(STORAGE_KEYS.TRANSACTIONS, null)) {
    setStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }
  if (!getStorage(STORAGE_KEYS.BUDGETS, null)) {
    setStorage(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS);
  }
  if (!getStorage(STORAGE_KEYS.BUDGET_CATEGORIES, null)) {
    setStorage(STORAGE_KEYS.BUDGET_CATEGORIES, INITIAL_BUDGET_CATEGORIES);
  }
  if (!getStorage(STORAGE_KEYS.GOALS, null)) {
    setStorage(STORAGE_KEYS.GOALS, INITIAL_GOALS);
  }
  if (!getStorage(STORAGE_KEYS.GOAL_CONTRIBUTIONS, null)) {
    setStorage(STORAGE_KEYS.GOAL_CONTRIBUTIONS, INITIAL_GOAL_CONTRIBUTIONS);
  }
  if (!getStorage(STORAGE_KEYS.NOTIFICATIONS, null)) {
    setStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!getStorage(STORAGE_KEYS.USER, null)) {
    setStorage(STORAGE_KEYS.USER, INITIAL_USER);
  }
}

export const localStore = {
  get: getStorage,
  set: setStorage,
  keys: STORAGE_KEYS,
  resetToDefaults: () => {
    localStorage.clear();
    initLocalStore();
  }
};
