import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';

export const budgetService = {
  /**
   * Get all budgets with category limits for a user
   */
  async getBudgets(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          budget_categories(
            id,
            category_id,
            limit_amount,
            category:categories(id, name, type, color, icon)
          )
        `)
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    // Local store implementation
    const budgets = localStore.get(localStore.keys.BUDGETS, []);
    const budgetCategories = localStore.get(localStore.keys.BUDGET_CATEGORIES, []);
    const categories = localStore.get(localStore.keys.CATEGORIES, []);

    const userBudgets = budgets.filter(b => b.user_id === userId);

    return userBudgets.map(b => {
      const bCats = budgetCategories
        .filter(bc => bc.budget_id === b.id)
        .map(bc => ({
          ...bc,
          category: categories.find(c => c.id === bc.category_id) || null,
        }));

      return {
        ...b,
        budget_categories: bCats,
      };
    });
  },

  /**
   * Create a new budget with category limits
   */
  async createBudget(budgetData, categoryLimits = []) {
    if (isSupabaseConfigured && supabase) {
      const { data: budget, error: bError } = await supabase
        .from('budgets')
        .insert([budgetData])
        .select()
        .single();

      if (bError) throw bError;

      if (categoryLimits.length > 0) {
        const catInserts = categoryLimits.map(cl => ({
          budget_id: budget.id,
          category_id: cl.category_id,
          limit_amount: cl.limit_amount,
        }));

        const { error: bcError } = await supabase
          .from('budget_categories')
          .insert(catInserts);

        if (bcError) throw bcError;
      }

      return budget;
    }

    const budgets = localStore.get(localStore.keys.BUDGETS, []);
    const budgetCategories = localStore.get(localStore.keys.BUDGET_CATEGORIES, []);

    const newBudgetId = `bud-${Date.now()}`;
    const newBudget = {
      ...budgetData,
      id: newBudgetId,
      created_at: new Date().toISOString(),
    };

    budgets.unshift(newBudget);
    localStore.set(localStore.keys.BUDGETS, budgets);

    for (const cl of categoryLimits) {
      budgetCategories.push({
        id: `bc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        budget_id: newBudgetId,
        category_id: cl.category_id,
        limit_amount: Number(cl.limit_amount),
      });
    }
    localStore.set(localStore.keys.BUDGET_CATEGORIES, budgetCategories);

    return newBudget;
  },

  /**
   * Update budget and category limits
   */
  async updateBudget(id, budgetData, categoryLimits = []) {
    if (isSupabaseConfigured && supabase) {
      const { data: budget, error: bError } = await supabase
        .from('budgets')
        .update(budgetData)
        .eq('id', id)
        .select()
        .single();

      if (bError) throw bError;

      // Delete existing and re-insert
      await supabase.from('budget_categories').delete().eq('budget_id', id);

      if (categoryLimits.length > 0) {
        const catInserts = categoryLimits.map(cl => ({
          budget_id: id,
          category_id: cl.category_id,
          limit_amount: cl.limit_amount,
        }));
        await supabase.from('budget_categories').insert(catInserts);
      }

      return budget;
    }

    const budgets = localStore.get(localStore.keys.BUDGETS, []);
    let budgetCategories = localStore.get(localStore.keys.BUDGET_CATEGORIES, []);

    const idx = budgets.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Presupuesto no encontrado');

    budgets[idx] = { ...budgets[idx], ...budgetData };
    localStore.set(localStore.keys.BUDGETS, budgets);

    // Filter out old limits and add new
    budgetCategories = budgetCategories.filter(bc => bc.budget_id !== id);
    for (const cl of categoryLimits) {
      budgetCategories.push({
        id: `bc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        budget_id: id,
        category_id: cl.category_id,
        limit_amount: Number(cl.limit_amount),
      });
    }
    localStore.set(localStore.keys.BUDGET_CATEGORIES, budgetCategories);

    return budgets[idx];
  },

  /**
   * Delete budget
   */
  async deleteBudget(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const budgets = localStore.get(localStore.keys.BUDGETS, []);
    const budgetCategories = localStore.get(localStore.keys.BUDGET_CATEGORIES, []);

    localStore.set(localStore.keys.BUDGETS, budgets.filter(b => b.id !== id));
    localStore.set(localStore.keys.BUDGET_CATEGORIES, budgetCategories.filter(bc => bc.budget_id !== id));
    return true;
  }
};
