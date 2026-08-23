import React from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../../contexts/FinanceContext';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { IconRenderer } from '../ui/IconRenderer';
import { ArrowRight, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { formatDate } from '../../utils/date';

export function RecentTransactionsTable({ onOpenCreateTx }) {
  const { recentTransactions, formatMoney } = useFinance();

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Últimos Movimientos</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tus transacciones más recientes
          </p>
        </div>
        <Link to="/transactions">
          <Button size="xs" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Ver todos
          </Button>
        </Link>
      </CardHeader>

      {recentTransactions.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">
          No tienes movimientos registrados todavía.{' '}
          <button
            type="button"
            onClick={onOpenCreateTx}
            className="text-emerald-500 font-semibold underline hover:text-emerald-400 ml-1"
          >
            Registrar primer movimiento
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-2">Fecha</th>
                <th className="pb-3 px-2">Descripción</th>
                <th className="pb-3 px-2">Categoría</th>
                <th className="pb-3 px-2">Cuenta</th>
                <th className="pb-3 px-2">Tipo</th>
                <th className="pb-3 px-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Fecha */}
                    <td className="py-3 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(tx.transaction_date, 'dd MMM')}
                    </td>

                    {/* Descripción */}
                    <td className="py-3 px-2 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : isTransfer
                              ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : isTransfer ? (
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="truncate max-w-[180px] sm:max-w-xs">{tx.description}</span>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
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
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                      <span className="truncate font-medium">{tx.account?.name || 'Cuenta'}</span>
                    </td>

                    {/* Tipo Badge */}
                    <td className="py-3 px-2">
                      <Badge
                        variant={isIncome ? 'emerald' : isTransfer ? 'cyan' : 'rose'}
                        size="xs"
                      >
                        {isIncome ? 'Ingreso' : isTransfer ? 'Transfer' : 'Gasto'}
                      </Badge>
                    </td>

                    {/* Monto */}
                    <td
                      className={`py-3 px-2 text-right font-bold whitespace-nowrap ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isTransfer
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isIncome ? `+${formatMoney(tx.amount)}` : isTransfer ? formatMoney(tx.amount) : `-${formatMoney(tx.amount)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
