import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Plus, PieChart, Menu, Target, BarChart3, Calendar, User, Settings, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

export function BottomNav({ onOpenCreateTx }) {
  const { isAdmin } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const moreItems = [
    { name: 'Metas de Ahorro', path: '/goals', icon: Target },
    { name: 'Análisis Financiero', path: '/analytics', icon: BarChart3 },
    { name: 'Calendario', path: '/calendar', icon: Calendar },
    { name: 'Cuentas', path: '/accounts', icon: LayoutDashboard },
    { name: 'Mi Perfil', path: '/profile', icon: User },
    { name: 'Configuración', path: '/settings', icon: Settings },
  ];

  if (isAdmin) {
    moreItems.push({ name: 'Panel Admin', path: '/admin', icon: ShieldAlert });
  }

  return (
    <>
      {/* Drawer for "Más" items on mobile */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative bg-white dark:bg-dark-card border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-6 z-10 space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Más opciones</span>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {moreItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-input hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-emerald-500" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark-card/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors py-1',
              isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Inicio</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors py-1',
              isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )
          }
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span>Movimientos</span>
        </NavLink>

        {/* Center Action Button */}
        <button
          type="button"
          onClick={onOpenCreateTx}
          className="w-12 h-12 -mt-5 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
          aria-label="Registrar movimiento"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <NavLink
          to="/budgets"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors py-1',
              isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )
          }
        >
          <PieChart className="w-5 h-5" />
          <span>Presupuestos</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={clsx(
            'flex flex-col items-center gap-1 text-[11px] font-medium py-1 transition-colors',
            showMoreMenu ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          )}
        >
          <Menu className="w-5 h-5" />
          <span>Más</span>
        </button>
      </div>
    </>
  );
}
