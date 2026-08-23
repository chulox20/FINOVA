import React from 'react';
import { PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';

export function SavingsRateGauge({ rate = 0, income = 0, savings = 0 }) {
  const clampedRate = Math.max(-100, Math.min(100, Number(rate) || 0));
  const isPositive = clampedRate >= 0;

  // Normalized gauge percentage (0 to 100 for circle stroke)
  const normalizedValue = Math.max(0, Math.min(100, clampedRate));
  const circumference = 2 * Math.PI * 40; // r=40
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Circular Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            className={`transition-all duration-1000 ease-out ${
              isPositive ? 'stroke-emerald-500' : 'stroke-rose-500'
            }`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-2xl font-extrabold tracking-tight ${
            isPositive ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {clampedRate > 0 ? `+${clampedRate}%` : `${clampedRate}%`}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Tasa de Ahorro
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isPositive
            ? `Estás ahorrando el ${clampedRate}% de cada dólar que ingresas.`
            : 'Tus gastos están superando a tus ingresos este período.'}
        </p>
      </div>
    </div>
  );
}
