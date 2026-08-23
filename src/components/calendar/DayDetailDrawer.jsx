import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useFinance } from '../../contexts/FinanceContext';
import { formatDate } from '../../utils/date';
import { Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Trash2 } from 'lucide-react';

export function DayDetailDrawer({ isOpen, onClose, selectedDay, onOpenNewTxForDay }) {
  const { formatMoney, removeTransaction } = useFinance();

  if (!selectedDay) return null;

  const { date, dayData } = selectedDay;
  const items = dayData?.items || [];
  const income = dayData?.income || 0;
  const expense = dayData?.expense || 0;
  const balance = income - expense;

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta transacción?')) {
      await removeTransaction(id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Movimientos del ${formatDate(date, 'dd MMMM yyyy')}`}
      subtitle={`Resumen financiero registrado en esta fecha`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Daily Summary Card */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-dark-input/60 rounded-xl border border-slate-100 dark:border-slate-800 text-center text-xs">
          <div>
            <span className="text-slate-400 block">Ingresos</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              +{formatMoney(income)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Gastos</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              -{formatMoney(expense)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Balance</span>
            <span className={`font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatMoney(balance)}
            </span>
          </div>
        </div>

        {/* Transactions list */}
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No hay movimientos registrados para este día.
            </div>
          ) : (
            items.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-card flex items-center justify-between gap-3 group hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : tx.type === 'transfer'
                        ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : tx.type === 'transfer' ? (
                      <ArrowLeftRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {tx.description}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {tx.category?.name || 'General'} • {tx.account?.name || 'Cuenta'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'transfer'
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {tx.type === 'income' ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.amount)}`}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onOpenNewTxForDay(date);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Añadir en este día
          </Button>
        </div>
      </div>
    </Modal>
  );
}
