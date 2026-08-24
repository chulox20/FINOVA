import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { IconRenderer } from '../../components/ui/IconRenderer';
import { CategoryModal } from '../../components/categories/CategoryModal';
import { Plus, Tag, Edit, Trash2, ShieldCheck } from 'lucide-react';

export function Categories() {
  const { categories, removeCategory } = useFinance();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const filteredCategories = categories.filter(c => {
    if (filterType === 'all') return true;
    if (filterType === 'expense') return c.type === 'expense' || c.type === 'both';
    if (filterType === 'income') return c.type === 'income' || c.type === 'both';
    return true;
  });

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta categoría personalizada?')) {
      await removeCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Categorías
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organiza tus gastos e ingresos con etiquetas predeterminadas y personalizadas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'all'
              ? 'bg-emerald-500 text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Todas ({categories.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('expense')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'expense'
              ? 'bg-emerald-500 text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Gastos ({categories.filter(c => c.type === 'expense' || c.type === 'both').length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('income')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'income'
              ? 'bg-emerald-500 text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Ingresos ({categories.filter(c => c.type === 'income' || c.type === 'both').length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((category) => {
          const isDefault = category.is_default;
          return (
            <Card
              key={category.id}
              className="p-4 flex items-center justify-between gap-3 group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                  style={{ backgroundColor: category.color || '#64748b' }}
                >
                  <IconRenderer name={category.icon || 'tag'} className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {category.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant={category.type === 'income' ? 'emerald' : category.type === 'both' ? 'cyan' : 'rose'}
                      size="xs"
                    >
                      {category.type === 'income' ? 'Ingreso' : category.type === 'both' ? 'Mixto' : 'Gasto'}
                    </Badge>
                    {isDefault && (
                      <span className="text-[10px] text-slate-400 font-medium">Predeterminada</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons (only for custom user categories) */}
              {!isDefault ? (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(category)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Editar categoría"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <ShieldCheck className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" title="Categoría del sistema" />
              )}
            </Card>
          );
        })}
      </div>

      {/* Category Create/Edit Modal */}
      <CategoryModal
        isOpen={isModalOpen || Boolean(editingCategory)}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        initialData={editingCategory}
      />
    </div>
  );
}
