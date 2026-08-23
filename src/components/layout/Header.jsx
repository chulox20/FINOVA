import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationBell } from './NotificationBell';
import { Button } from '../ui/Button';
import { Sun, Moon, Plus, ArrowLeftRight, Sparkles, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header({ title, subtitle, onOpenNewTx, onOpenTransfer }) {
  const { profile, user } = useAuth();
  const { isDark, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-slate-200/80 dark:border-dark-border px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Transfer Button (Desktop) */}
        {onOpenTransfer && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenTransfer}
            className="hidden sm:inline-flex"
            leftIcon={<ArrowLeftRight className="w-4 h-4" />}
          >
            Transferir
          </Button>
        )}

        {/* Quick New Movement Button */}
        {onOpenNewTx && (
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenNewTx}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Nuevo Movimiento</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          aria-label="Cambiar tema"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Profile Avatar link */}
        <Link
          to="/profile"
          className="flex items-center ring-2 ring-transparent hover:ring-emerald-500 rounded-xl transition-all p-0.5"
          title="Ver perfil"
        >
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={profile?.full_name || 'Usuario'}
            className="w-8 h-8 rounded-lg object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
