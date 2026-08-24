import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/Button';
import { Plus, ArrowLeftRight, TrendingUp, Calendar, Sparkles } from 'lucide-react';

export function BalanceHero({ onOpenNewTx, onOpenTransfer }) {
  const { profile } = useAuth();
  const { totalNetWorth, selectedPeriod, setSelectedPeriod, formatMoney } = useFinance();

  const periods = [
    { id: 'this_month', label: 'Este mes' },
    { id: 'last_3_months', label: 'Últimos 3 meses' },
    { id: 'this_year', label: 'Este año' },
  ];

  const firstName = profile?.full_name?.split(' ')[0] || 'Jesús';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Saludo & Total Balance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">👋</span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-200">
              Hola, <span className="text-white font-extrabold">{firstName}</span>
            </h2>
            <span className="hidden sm:inline-block text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
              Finanzas al día
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Balance Total (Patrimonio Neto)
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                {formatMoney(totalNetWorth)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Period Selector & Quick Actions */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-3">
          {/* Period Selector Tabs */}
          <div className="bg-slate-800/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 self-stretch sm:self-auto">
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPeriod(p.id)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedPeriod === p.id
                    ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="white"
              onClick={onOpenTransfer}
              leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-initial"
            >
              Transferir
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={onOpenNewTx}
              leftIcon={<Plus className="w-4 h-4" />}
              className="flex-1 sm:flex-initial shadow-glow"
            >
              Movimiento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
