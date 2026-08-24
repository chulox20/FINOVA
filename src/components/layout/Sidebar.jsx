import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  PieChart,
  Target,
  BarChart3,
  Calendar,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { clsx } from 'clsx';

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, profile, isAdmin, logout, isDemoMode, loginAsDemoUser, loginAsDemoAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Movimientos', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Cuentas', path: '/accounts', icon: Wallet },
    { name: 'Categorías', path: '/categories', icon: Tags },
    { name: 'Presupuestos', path: '/budgets', icon: PieChart },
    { name: 'Metas de Ahorro', path: '/goals', icon: Target },
    { name: 'Análisis', path: '/analytics', icon: BarChart3 },
    { name: 'Calendario', path: '/calendar', icon: Calendar },
    { name: 'Mi Perfil', path: '/profile', icon: User },
    { name: 'Configuración', path: '/settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({
      name: 'Panel Admin',
      path: '/admin',
      icon: ShieldAlert,
      isAdminBadge: true,
    });
  }

  return (
    <aside
      className={clsx(
        'hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30',
        'bg-white dark:bg-dark-card border-r border-slate-200/80 dark:border-dark-border',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-3 group overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 p-0.5 shadow-sm group-hover:shadow-glow shrink-0 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-emerald-400 font-extrabold text-lg tracking-tighter">F</span>
            </div>
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                FINOVA
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider -mt-1 uppercase">
                Finanzas Claras
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Demo Mode Switcher Ribbon */}
      {isDemoMode && !collapsed && (
        <div className="mx-3 mt-3 p-2.5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modo Demo</span>
          </div>
          <button
            type="button"
            onClick={isAdmin ? loginAsDemoUser : loginAsDemoAdmin}
            className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline font-medium"
          >
            {isAdmin ? 'Ver como Usuario' : 'Ver como Admin'}
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.name : undefined}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
                collapsed && 'justify-center px-0'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={clsx(
                    'w-5 h-5 shrink-0 transition-colors',
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  )}
                />

                {!collapsed && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}

                {!collapsed && item.isAdminBadge && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-bold rounded-md uppercase">
                    Admin
                  </span>
                )}

                {isActive && (
                  <div
                    className={clsx(
                      'absolute left-0 w-1 bg-emerald-500 rounded-r-full',
                      collapsed ? 'h-6' : 'h-5'
                    )}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0 space-y-2">
        {/* Quick Theme Switcher in sidebar */}
        <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500">
          {!collapsed && <span>Apariencia</span>}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
            title="Cambiar tema"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card */}
        <div
          className={clsx(
            'flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-dark-input/60 border border-slate-100 dark:border-slate-800/80',
            collapsed && 'justify-center p-1.5'
          )}
        >
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={profile?.full_name || 'Usuario'}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
          />

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {profile?.full_name || user?.email || 'Jesús Figueroa'}
              </p>
              <p className="text-[10px] text-slate-400 truncate capitalize">
                Rol: {profile?.role || 'user'}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
