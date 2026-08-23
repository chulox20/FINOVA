import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';

export const transactionService = {
  /**
   * Get transactions with optional filters
   */
  async getTransactions(userId, filters = {}) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          account:accounts!account_id(id, name, type, color, icon),
          to_account:accounts!to_account_id(id, name, type, color, icon),
          category:categories(id, name, type, color, icon)
        `)
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.category_id && filters.category_id !== 'all') {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.account_id && filters.account_id !== 'all') {
        query = query.eq('account_id', filters.account_id);
      }
      if (filters.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }
      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    // Local store implementation
    let transactions = localStore.get(localStore.keys.TRANSACTIONS, []);
    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);
    const categories = localStore.get(localStore.keys.CATEGORIES, []);

    let filtered = transactions.filter(t => t.user_id === userId);

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters.category_id && filters.category_id !== 'all') {
      filtered = filtered.filter(t => t.category_id === filters.category_id);
    }
    if (filters.account_id && filters.account_id !== 'all') {
      filtered = filtered.filter(t => t.account_id === filters.account_id || t.to_account_id === filters.account_id);
    }
    if (filters.startDate) {
      filtered = filtered.filter(t => t.transaction_date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => t.transaction_date <= filters.endDate);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        (t.description || '').toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q)
      );
    }
    if (filters.minAmount) {
      filtered = filtered.filter(t => Number(t.amount) >= Number(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(t => Number(t.amount) <= Number(filters.maxAmount));
    }

    // Enrich with joined accounts and categories
    return filtered
      .map(t => ({
        ...t,
        account: accounts.find(a => a.id === t.account_id) || null,
        to_account: accounts.find(a => a.id === t.to_account_id) || null,
        category: categories.find(c => c.id === t.category_id) || null,
      }))
      .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  },

  /**
   * Create a new transaction and update account balance
   */
  async createTransaction(transactionData) {
    const amount = Number(transactionData.amount);
    if (isNaN(amount) || amount <= 0) throw new Error('El monto debe ser un número positivo');

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select(`
          *,
          account:accounts!account_id(id, name, type, color, icon),
          category:categories(id, name, type, color, icon)
        `)
        .single();

      if (error) throw error;
      return data;
    }

    // Local store implementation
    const transactions = localStore.get(localStore.keys.TRANSACTIONS, []);
    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);
    const categories = localStore.get(localStore.keys.CATEGORIES, []);

    const newTx = {
      ...transactionData,
      id: `tx-${Date.now()}`,
      amount,
      created_at: new Date().toISOString(),
    };

    // Update account balances
    const accIdx = accounts.findIndex(a => a.id === newTx.account_id);
    if (accIdx !== -1) {
      if (newTx.type === 'income') {
        accounts[accIdx].balance = Number(accounts[accIdx].balance) + amount;
      } else if (newTx.type === 'expense') {
        accounts[accIdx].balance = Number(accounts[accIdx].balance) - amount;
      } else if (newTx.type === 'transfer' && newTx.to_account_id) {
        accounts[accIdx].balance = Number(accounts[accIdx].balance) - amount;
        const toAccIdx = accounts.findIndex(a => a.id === newTx.to_account_id);
        if (toAccIdx !== -1) {
          accounts[toAccIdx].balance = Number(accounts[toAccIdx].balance) + amount;
        }
      }
      localStore.set(localStore.keys.ACCOUNTS, accounts);
    }

    transactions.unshift(newTx);
    localStore.set(localStore.keys.TRANSACTIONS, transactions);

    return {
      ...newTx,
      account: accounts.find(a => a.id === newTx.account_id) || null,
      category: categories.find(c => c.id === newTx.category_id) || null,
    };
  },

  /**
   * Update an existing transaction
   */
  async updateTransaction(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          account:accounts!account_id(id, name, type, color, icon),
          category:categories(id, name, type, color, icon)
        `)
        .single();

      if (error) throw error;
      return data;
    }

    const transactions = localStore.get(localStore.keys.TRANSACTIONS, []);
    const idx = transactions.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Movimiento no encontrado');

    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);
    const categories = localStore.get(localStore.keys.CATEGORIES, []);
    const oldTx = transactions[idx];

    // Revert old transaction balance impact
    const oldAcc = accounts.find(a => a.id === oldTx.account_id);
    if (oldAcc) {
      if (oldTx.type === 'income') oldAcc.balance -= oldTx.amount;
      if (oldTx.type === 'expense') oldAcc.balance += oldTx.amount;
    }

    // Apply new transaction
    const updatedTx = { ...oldTx, ...updates, amount: Number(updates.amount ?? oldTx.amount) };
    const newAcc = accounts.find(a => a.id === updatedTx.account_id);
    if (newAcc) {
      if (updatedTx.type === 'income') newAcc.balance += updatedTx.amount;
      if (updatedTx.type === 'expense') newAcc.balance -= updatedTx.amount;
    }

    localStore.set(localStore.keys.ACCOUNTS, accounts);

    transactions[idx] = updatedTx;
    localStore.set(localStore.keys.TRANSACTIONS, transactions);

    return {
      ...updatedTx,
      account: accounts.find(a => a.id === updatedTx.account_id) || null,
      category: categories.find(c => c.id === updatedTx.category_id) || null,
    };
  },

  /**
   * Delete transaction and revert balance
   */
  async deleteTransaction(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const transactions = localStore.get(localStore.keys.TRANSACTIONS, []);
    const tx = transactions.find(t => t.id === id);
    if (!tx) return true;

    // Revert account balance
    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);
    const acc = accounts.find(a => a.id === tx.account_id);
    if (acc) {
      if (tx.type === 'income') acc.balance -= Number(tx.amount);
      if (tx.type === 'expense') acc.balance += Number(tx.amount);
      if (tx.type === 'transfer' && tx.to_account_id) {
        acc.balance += Number(tx.amount);
        const toAcc = accounts.find(a => a.id === tx.to_account_id);
        if (toAcc) toAcc.balance -= Number(tx.amount);
      }
      localStore.set(localStore.keys.ACCOUNTS, accounts);
    }

    const filtered = transactions.filter(t => t.id !== id);
    localStore.set(localStore.keys.TRANSACTIONS, filtered);
    return true;
  }
};
