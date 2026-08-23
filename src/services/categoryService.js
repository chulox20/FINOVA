import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';

export const categoryService = {
  /**
   * Get all categories available to user (defaults + custom)
   */
  async getCategories(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},is_default.eq.true`)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    }

    const categories = localStore.get(localStore.keys.CATEGORIES, []);
    return categories.filter(c => c.is_default || c.user_id === userId);
  },

  /**
   * Create custom category
   */
  async createCategory(categoryData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...categoryData, is_default: false }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const categories = localStore.get(localStore.keys.CATEGORIES, []);
    const newCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      is_default: false,
      created_at: new Date().toISOString(),
    };
    categories.push(newCategory);
    localStore.set(localStore.keys.CATEGORIES, categories);
    return newCategory;
  },

  /**
   * Update category
   */
  async updateCategory(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const categories = localStore.get(localStore.keys.CATEGORIES, []);
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Categoría no encontrada');

    categories[idx] = { ...categories[idx], ...updates };
    localStore.set(localStore.keys.CATEGORIES, categories);
    return categories[idx];
  },

  /**
   * Delete category
   */
  async deleteCategory(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const categories = localStore.get(localStore.keys.CATEGORIES, []);
    const filtered = categories.filter(c => c.id !== id);
    localStore.set(localStore.keys.CATEGORIES, filtered);
    return true;
  }
};
