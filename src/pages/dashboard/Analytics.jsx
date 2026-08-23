import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IncomeExpenseAreaChart } from '../../components/charts/IncomeExpenseAreaChart';
import { CategoryDonutChart } from '../../components/charts/CategoryDonutChart';
import { BalanceLineChart } from '../../components/charts/BalanceLineChart';
import { SavingsRateGauge } from '../../components/charts/SavingsRateGauge';
import { Download, TrendingUp, TrendingDown, Calendar, BarChart3, PiggyBank } from 'lucide-react';
import { formatPercentage } from '../../utils/currency';

export function Analytics() {
  const {
    monthlyEvolution12,
    categoryDistribution,
    currentMonthSummary,
    previousMonthSummary,
    kpiTrends,
    formatMoney,
    exportCSV,
  } = useFinance();

  const { income, expense, savings, savingsRate } = currentMonthSummary;
  const { incomeTrend, expenseTrend, savingsTrend } = kpiTrends;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Análisis Financiero
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas clave, tasas de ahorro y proyecciones a largo plazo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportCSV()}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Descargar Reporte CSV
          </Button>
        </div>
      </div>

      {/* Row 1: Savings Rate Gauge + Monthly Comparison Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Rate Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div>
              <CardTitle>Tasa de Ahorro</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                (Ingresos - Gastos) / Ingresos × 100
              </p>
            </div>
          </CardHeader>

          <SavingsRateGauge
            rate={savingsRate}
            income={income}
            savings={savings}
          />

          <div className="p-3 bg-slate-50 dark:bg-dark-input/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex justify-between">
            <span className="text-slate-500">Ahorro neto este mes:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(savings)}</span>
          </div>
        </Card>

        {/* Monthly Comparison Card (Este mes vs Mes anterior) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader>
            <div>
              <CardTitle>Comparación Mensual</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rendimiento financiero comparado con el mes anterior
              </p>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Ingresos comparison */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-input/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Ingresos</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{formatMoney(income)}</p>
              <p className="text-xs text-slate-400">Anterior: {formatMoney(previousMonthSummary.income)}</p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold">
                <span className={incomeTrend >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                  {formatPercentage(incomeTrend)}
                </span>
                <span className="text-[11px] text-slate-400 font-normal">variación</span>
              </div>
            </div>

            {/* Gastos comparison */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-input/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Gastos</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{formatMoney(expense)}</p>
              <p className="text-xs text-slate-400">Anterior: {formatMoney(previousMonthSummary.expense)}</p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold">
                <span className={expenseTrend <= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                  {formatPercentage(expenseTrend)}
                </span>
                <span className="text-[11px] text-slate-400 font-normal">{expenseTrend <= 0 ? 'reducción' : 'aumento'}</span>
              </div>
            </div>

            {/* Ahorro comparison */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-input/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Ahorro</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{formatMoney(savings)}</p>
              <p className="text-xs text-slate-400">Anterior: {formatMoney(previousMonthSummary.savings)}</p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold">
                <span className={savingsTrend >= 0 ? 'text-cyan-500' : 'text-rose-500'}>
                  {formatPercentage(savingsTrend)}
                </span>
                <span className="text-[11px] text-slate-400 font-normal">crecimiento</span>
              </div>
            </div>
          </div>

          <div className="pt-4 text-xs text-slate-400">
            * Los cálculos se actualizan en tiempo real tras cada nuevo registro.
          </div>
        </Card>
      </div>

      {/* Row 2: 12-Month Area Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Evolución de Ingresos y Gastos (12 Meses)</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tendencia anual acumulada de flujos de dinero
            </p>
          </div>
        </CardHeader>
        <div className="pt-2">
          <IncomeExpenseAreaChart data={monthlyEvolution12} height={320} />
        </div>
      </Card>

      {/* Row 3: Category Donut + Balance Evolution Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Distribución de Gastos por Categoría</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Clasificación de egresos en el período seleccionado
              </p>
            </div>
          </CardHeader>
          <div className="pt-2">
            <CategoryDonutChart data={categoryDistribution} height={280} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Evolución del Balance Acumulado</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Progresión de ahorro neto a través del tiempo
              </p>
            </div>
          </CardHeader>
          <div className="pt-2">
            <BalanceLineChart data={monthlyEvolution12} height={280} />
          </div>
        </Card>
      </div>
    </div>
  );
}
