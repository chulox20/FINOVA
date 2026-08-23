import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Sun, Moon, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { isDark, setTheme, theme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 dark:bg-dark-bg/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 p-0.5 shadow-sm group-hover:shadow-glow transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-emerald-400 font-extrabold text-lg tracking-tighter">F</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              FINOVA
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#beneficios" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
            Beneficios
          </a>
          <a href="#preview" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
            Cómo funciona
          </a>
          <a href="#seguridad" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Seguridad
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <Link to="/dashboard">
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ir al Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button size="sm" variant="ghost">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="primary" rightIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Comenzar gratis
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
