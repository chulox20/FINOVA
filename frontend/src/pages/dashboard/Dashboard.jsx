import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useFinance } from '../../contexts/FinanceContext';
import { BalanceHero } from '../../components/dashboard/BalanceHero';
import { KpiCards } from '../../components/dashboard/KpiCards';
import { BudgetAlertBanner } from '../../components/dashboard/BudgetAlertBanner';
import { RecentTransactionsTable } from '../../components/dashboard/RecentTransactionsTable';
import { IncomeExpenseAreaChart } from '../../components/charts/IncomeExpenseAreaChart';
import { CategoryDonutChart } from '../../components/charts/CategoryDonutChart';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

export function Dashboard() {
  const { onOpenCreateTx, onOpenTransfer } = useOutletContext();
  const {
    monthlyEvolution6,
    categoryDistribution,
    loading,
    error,
  } = useFinance();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Hero Balance & Saludo */}
      <BalanceHero
        onOpenNewTx={onOpenCreateTx}
        onOpenTransfer={onOpenTransfer}
      />

      {/* 2. Budget Alert Banners (if any) */}
      <BudgetAlertBanner />

      {/* 3. 4 KPI Cards */}
      <KpiCards />

      {/* 4. Charts Section: Main Area Chart + Category Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Income vs Expense Area Chart (2 cols) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader>
            <div>
              <CardTitle>Ingresos vs Gastos</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evolución de los últimos 6 meses y área de ahorro
              </p>
            </div>
          </CardHeader>
          <div className="pt-2">
            <IncomeExpenseAreaChart data={monthlyEvolution6} height={280} />
          </div>
        </Card>

        {/* Category Expense Breakdown Donut Chart (1 col) */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div>
              <CardTitle>Gastos por Categoría</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Distribución porcentual de egresos
              </p>
            </div>
          </CardHeader>
          <div className="pt-2">
            <CategoryDonutChart data={categoryDistribution} height={260} />
          </div>
        </Card>
      </div>

      {/* 5. Recent Transactions Table */}
      <RecentTransactionsTable onOpenCreateTx={onOpenCreateTx} />
    </div>
  );
}
