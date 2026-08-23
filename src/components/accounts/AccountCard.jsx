import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { IconRenderer } from '../ui/IconRenderer';
import { useFinance } from '../../contexts/FinanceContext';
import { ArrowLeftRight, Edit, Trash2 } from 'lucide-react';

const ACCOUNT_TYPE_LABELS = {
  checking: 'Cuenta Corriente',
  savings: 'Cuenta de Ahorros',
  cash: 'Efectivo / Billetera',
  credit_card: 'Tarjeta de Crédito',
  investment: 'Inversión',
};

export function AccountCard({ account, onEdit, onDelete, onTransfer }) {
  const { formatMoney } = useFinance();
  const isNegative = Number(account.balance) < 0;

  return (
    <Card className="relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      {/* Top Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: account.color || '#10b981' }}
      />

      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: account.color || '#10b981' }}
            >
              <IconRenderer name={account.icon || 'wallet'} className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {account.name}
              </h4>
              <p className="text-xs text-slate-400">
                {ACCOUNT_TYPE_LABELS[account.type] || account.type}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(account)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Editar cuenta"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(account.id)}
              className="p-1 text-slate-400 hover:text-rose-500"
              title="Eliminar cuenta"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="mt-4 pt-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Balance disponible
          </span>
          <div
            className={`text-2xl font-extrabold tracking-tight mt-0.5 ${
              isNegative
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatMoney(account.balance)}
          </div>
        </div>
      </div>

      {/* Bottom Transfer button */}
      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">{account.currency || 'USD'}</span>
        <button
          type="button"
          onClick={() => onTransfer(account)}
          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
        >
          <ArrowLeftRight className="w-3 h-3" />
          <span>Transferir dinero</span>
        </button>
      </div>
    </Card>
  );
}
