import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useFinance } from '../../contexts/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { TransactionModal } from '../../components/transactions/TransactionModal';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Trash2,
  Edit,
  Calendar,
  X,
} from 'lucide-react';
import { formatDate } from '../../utils/date';

export function Transactions() {
  const { onOpenCreateTx } = useOutletContext();
  const { transactions, accounts, categories, removeTransaction, formatMoney, exportCSV } = useFinance();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const [editingTx, setEditingTx] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filtered transactions list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const notesMatch = (tx.notes || '').toLowerCase().includes(q);
        if (!descMatch && !notesMatch) return false;
      }

      // Type
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Category
      if (categoryFilter !== 'all' && tx.category_id !== categoryFilter) return false;

      // Account
      if (accountFilter !== 'all' && tx.account_id !== accountFilter && tx.to_account_id !== accountFilter) return false;

      // Dates
      if (startDate && tx.transaction_date < startDate) return false;
      if (endDate && tx.transaction_date > endDate) return false;

      // Amount
      if (minAmount && Number(tx.amount) < Number(minAmount)) return false;
      if (maxAmount && Number(tx.amount) > Number(maxAmount)) return false;

      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter, accountFilter, startDate, endDate, minAmount, maxAmount]);

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setAccountFilter('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
      await removeTransaction(id);
    }
  };

  const hasActiveFilters = Boolean(
    search || typeFilter !== 'all' || categoryFilter !== 'all' || accountFilter !== 'all' || startDate || endDate || minAmount || maxAmount
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Movimientos Financieros
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transacción encontrada' : 'transacciones encontradas'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportCSV(filteredTransactions)}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar CSV
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onOpenCreateTx}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="flex-1 w-full">
            <Input
              placeholder="Buscar por descripción o nota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-44">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="expense">Solo Gastos</option>
              <option value="income">Solo Ingresos</option>
              <option value="transfer">Transferencias</option>
            </Select>
          </div>

          {/* Account Filter */}
          <div className="w-full md:w-48">
            <Select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
            >
              <option value="all">Todas las cuentas</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          </div>

          {/* Toggle Advanced Filters Button */}
          <Button
            size="md"
            variant={showAdvancedFilters || hasActiveFilters ? 'secondary' : 'outline'}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filtros
          </Button>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <Select
              label="Categoría"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            <Input
              label="Desde Fecha"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="Hasta Fecha"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <Input
                label="Monto Mín"
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
              <Input
                label="Monto Máx"
                type="number"
                placeholder="10000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Clear Filters indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>Filtros activos aplicados</span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-rose-500 font-semibold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          </div>
        )}
      </Card>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon="arrow-left-right"
          title="No se encontraron movimientos"
          description={
            hasActiveFilters
              ? 'Prueba a cambiar o limpiar los filtros de búsqueda.'
              : 'Empieza registrando tu primer ingreso, gasto o transferencia.'
          }
          actionLabel={hasActiveFilters ? 'Limpiar filtros' : 'Registrar Movimiento'}
          onAction={hasActiveFilters ? handleClearFilters : onOpenCreateTx}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-input/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Cuenta</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Fecha */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(tx.transaction_date, 'dd MMM yyyy')}
                      </td>

                      {/* Descripción */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : isTransfer
                                ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : isTransfer ? (
                              <ArrowLeftRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="block truncate max-w-xs">{tx.description}</span>
                            {tx.notes && (
                              <span className="text-[10px] text-slate-400 font-normal block truncate max-w-xs">
                                {tx.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {tx.category ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: tx.category.color }}
                            />
                            <span className="truncate">{tx.category.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sin categoría</span>
                        )}
                      </td>

                      {/* Cuenta */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {isTransfer && tx.to_account ? (
                          <span className="truncate font-medium">
                            {tx.account?.name} → {tx.to_account?.name}
                          </span>
                        ) : (
                          <span className="truncate font-medium">{tx.account?.name || 'Cuenta'}</span>
                        )}
                      </td>

                      {/* Tipo */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={isIncome ? 'emerald' : isTransfer ? 'cyan' : 'rose'}
                          size="xs"
                        >
                          {isIncome ? 'Ingreso' : isTransfer ? 'Transferencia' : 'Gasto'}
                        </Badge>
                      </td>

                      {/* Monto */}
                      <td
                        className={`py-3.5 px-4 text-right font-extrabold whitespace-nowrap ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                            ? 'text-cyan-600 dark:text-cyan-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {isIncome ? `+${formatMoney(tx.amount)}` : isTransfer ? formatMoney(tx.amount) : `-${formatMoney(tx.amount)}`}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setEditingTx(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={Boolean(editingTx)}
        onClose={() => setEditingTx(null)}
        initialData={editingTx}
      />
    </div>
  );
}
