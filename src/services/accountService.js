import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';

export const accountService = {
  /**
   * Fetch all accounts for the current user
   */
  async getAccounts(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }

    // Local Store fallback
    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);
    return accounts.filter(a => a.user_id === userId);
  },

  /**
   * Create a new account
   */
  async createAccount(accountData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Local Store fallback
    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);
    const newAccount = {
      ...accountData,
      id: `acc-${Date.now()}`,
      created_at: new Date().toISOString(),
      balance: Number(accountData.balance) || 0,
    };
    accounts.push(newAccount);
    localStore.set(localStore.keys.ACCOUNTS, accounts);
    return newAccount;
  },

  /**
   * Update an existing account
   */
  async updateAccount(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);
    const idx = accounts.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Cuenta no encontrada');

    accounts[idx] = { ...accounts[idx], ...updates, balance: Number(updates.balance ?? accounts[idx].balance) };
    localStore.set(localStore.keys.ACCOUNTS, accounts);
    return accounts[idx];
  },

  /**
   * Delete an account
   */
  async deleteAccount(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);
    const filtered = accounts.filter(a => a.id !== id);
    localStore.set(localStore.keys.ACCOUNTS, filtered);
    return true;
  },

  /**
   * Transfer funds between two accounts
   */
  async transferFunds({ userId, fromAccountId, toAccountId, amount, description, date, notes }) {
    const numAmount = Number(amount);
    if (numAmount <= 0) throw new Error('El monto debe ser mayor a cero');

    if (isSupabaseConfigured && supabase) {
      // Create transfer transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          account_id: fromAccountId,
          to_account_id: toAccountId,
          type: 'transfer',
          description: description || 'Transferencia entre cuentas',
          amount: numAmount,
          transaction_date: date || new Date().toISOString().split('T')[0],
          notes: notes || '',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Local store transfer
    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);
    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);

    if (!fromAcc || !toAcc) throw new Error('Cuentas no válidas para la transferencia');

    fromAcc.balance = Number(fromAcc.balance) - numAmount;
    toAcc.balance = Number(toAcc.balance) + numAmount;
    localStore.set(localStore.keys.ACCOUNTS, accounts);

    const transactions = localStore.get(localStore.keys.TRANSACTIONS, []);
    const newTx = {
      id: `tx-${Date.now()}`,
      user_id: userId,
      account_id: fromAccountId,
      to_account_id: toAccountId,
      type: 'transfer',
      description: description || `Transferencia a ${toAcc.name}`,
      amount: numAmount,
      transaction_date: date || new Date().toISOString().split('T')[0],
      notes: notes || '',
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    localStore.set(localStore.keys.TRANSACTIONS, transactions);

    return newTx;
  }
};
