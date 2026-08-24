import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Sparkles, Shield, Trash2, X } from 'lucide-react';
import { formatRelativeDate } from '../../utils/date';

export function NotificationBell() {
  const { notifications, unreadNotificationsCount, markNotificationRead, markAllNotificationsRead, removeNotification } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'budget':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'goal':
        return <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'security':
        return <Shield className="w-4 h-4 text-indigo-500 shrink-0" />;
      default:
        return <AlertCircle className="w-4 h-4 text-cyan-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        aria-label="Ver notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-card animate-pulse">
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Notificaciones
              </h4>
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full">
                  {unreadNotificationsCount} nuevas
                </span>
              )}
            </div>

            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                No tienes notificaciones por el momento
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markNotificationRead(n.id)}
                  className={`p-3.5 transition-colors flex items-start gap-3 group cursor-pointer ${
                    n.is_read
                      ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      : 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-white dark:bg-dark-input border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold ${n.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeDate(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                    title="Eliminar notificación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
