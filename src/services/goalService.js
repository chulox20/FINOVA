import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';

export const goalService = {
  /**
   * Get all goals for a user
   */
  async getGoals(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          account:accounts!account_id(id, name, type, color, icon),
          goal_contributions(id, amount, contribution_date, note, created_at)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    const goals = localStore.get(localStore.keys.GOALS, []);
    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);
    const contributions = localStore.get(localStore.keys.GOAL_CONTRIBUTIONS, []);

    return goals
      .filter(g => g.user_id === userId)
      .map(g => ({
        ...g,
        account: accounts.find(a => a.id === g.account_id) || null,
        goal_contributions: contributions
          .filter(gc => gc.goal_id === g.id)
          .sort((a, b) => new Date(b.contribution_date) - new Date(a.contribution_date)),
      }));
  },

  /**
   * Create a new savings goal
   */
  async createGoal(goalData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const goals = localStore.get(localStore.keys.GOALS, []);
    const newGoal = {
      ...goalData,
      id: `gol-${Date.now()}`,
      current_amount: Number(goalData.current_amount) || 0,
      target_amount: Number(goalData.target_amount),
      status: goalData.status || 'active',
      created_at: new Date().toISOString(),
    };

    goals.unshift(newGoal);
    localStore.set(localStore.keys.GOALS, goals);
    return newGoal;
  },

  /**
   * Update goal
   */
  async updateGoal(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const goals = localStore.get(localStore.keys.GOALS, []);
    const idx = goals.findIndex(g => g.id === id);
    if (idx === -1) throw new Error('Meta no encontrada');

    goals[idx] = { ...goals[idx], ...updates };
    localStore.set(localStore.keys.GOALS, goals);
    return goals[idx];
  },

  /**
   * Delete goal
   */
  async deleteGoal(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const goals = localStore.get(localStore.keys.GOALS, []);
    const contributions = localStore.get(localStore.keys.GOAL_CONTRIBUTIONS, []);

    localStore.set(localStore.keys.GOALS, goals.filter(g => g.id !== id));
    localStore.set(localStore.keys.GOAL_CONTRIBUTIONS, contributions.filter(gc => gc.goal_id !== id));
    return true;
  },

  /**
   * Add contribution to a goal
   */
  async addContribution({ goalId, userId, amount, accountId, note, date }) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) throw new Error('El monto del aporte debe ser mayor a cero');

    if (isSupabaseConfigured && supabase) {
      // 1. Insert contribution
      const { data: contrib, error: cErr } = await supabase
        .from('goal_contributions')
        .insert([{
          goal_id: goalId,
          user_id: userId,
          amount: numAmount,
          contribution_date: date || new Date().toISOString().split('T')[0],
          note: note || '',
        }])
        .select()
        .single();

      if (cErr) throw cErr;

      // 2. If accountId provided, optionally create a movement
      if (accountId) {
        await supabase.from('transactions').insert([{
          user_id: userId,
          account_id: accountId,
          type: 'expense',
          description: `Aporte a meta: ${note || 'Ahorro programado'}`,
          amount: numAmount,
          transaction_date: date || new Date().toISOString().split('T')[0],
          notes: `Transferido a meta de ahorro`,
        }]);
      }

      return contrib;
    }

    // Local store implementation
    const goals = localStore.get(localStore.keys.GOALS, []);
    const contributions = localStore.get(localStore.keys.GOAL_CONTRIBUTIONS, []);
    const accounts = localStore.get(localStore.keys.ACCOUNTS, []);

    const goalIdx = goals.findIndex(g => g.id === goalId);
    if (goalIdx === -1) throw new Error('Meta no encontrada');

    const newCurrent = Number(goals[goalIdx].current_amount) + numAmount;
    goals[goalIdx].current_amount = newCurrent;
    if (newCurrent >= Number(goals[goalIdx].target_amount)) {
      goals[goalIdx].status = 'completed';
    }
    localStore.set(localStore.keys.GOALS, goals);

    // Save contribution
    const newContrib = {
      id: `gc-${Date.now()}`,
      goal_id: goalId,
      user_id: userId,
      amount: numAmount,
      contribution_date: date || new Date().toISOString().split('T')[0],
      note: note || 'Aporte a meta de ahorro',
      created_at: new Date().toISOString(),
    };
    contributions.unshift(newContrib);
    localStore.set(localStore.keys.GOAL_CONTRIBUTIONS, contributions);

    // Deduct from account if specified
    if (accountId) {
      const accIdx = accounts.findIndex(a => a.id === accountId);
      if (accIdx !== -1) {
        accounts[accIdx].balance = Number(accounts[accIdx].balance) - numAmount;
        localStore.set(localStore.keys.ACCOUNTS, accounts);
      }
    }

    return newContrib;
  }
};
