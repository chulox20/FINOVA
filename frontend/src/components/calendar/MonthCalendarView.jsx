import React, { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useFinance } from '../../contexts/FinanceContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function MonthCalendarView({ onSelectDay, onOpenNewTxForDay }) {
  const { transactions, formatMoney } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Starts Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Map transactions by ISO date string
  const txByDay = {};
  for (const t of transactions) {
    if (!t.transaction_date) continue;
    if (!txByDay[t.transaction_date]) {
      txByDay[t.transaction_date] = { income: 0, expense: 0, items: [] };
    }
    txByDay[t.transaction_date].items.push(t);
    if (t.type === 'income') {
      txByDay[t.transaction_date].income += Number(t.amount) || 0;
    } else if (t.type === 'expense') {
      txByDay[t.transaction_date].expense += Number(t.amount) || 0;
    }
  }

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h3>
          <p className="text-xs text-slate-400">
            Haz clic en un día para inspeccionar los movimientos detallados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="xs" variant="outline" onClick={handleToday}>
            Hoy
          </Button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
        {weekDayNames.map((name, idx) => (
          <div key={idx} className="py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayToday = isToday(day);
          const dayData = txByDay[dateKey];

          return (
            <div
              key={idx}
              onClick={() => onSelectDay({ date: dateKey, dayData, dayObj: day })}
              className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                !isCurrentMonth
                  ? 'opacity-30 bg-slate-50/50 dark:bg-dark-card/20 border-transparent'
                  : dayToday
                  ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-dark-card hover:border-emerald-500/40 hover:shadow-xs'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center ${
                    dayToday
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {dayData && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {dayData.items.length} mov.
                  </span>
                )}
              </div>

              {/* Transactions Summary Pills */}
              <div className="space-y-1 mt-1">
                {dayData?.income > 0 && (
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded px-1 py-0.5 flex items-center gap-0.5 truncate">
                    <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                    <span>+{formatMoney(dayData.income, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                )}

                {dayData?.expense > 0 && (
                  <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 rounded px-1 py-0.5 flex items-center gap-0.5 truncate">
                    <ArrowDownRight className="w-2.5 h-2.5 shrink-0" />
                    <span>-{formatMoney(dayData.expense, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
