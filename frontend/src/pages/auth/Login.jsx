import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Lock, Mail, Sparkles, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  remember: z.boolean().optional(),
});

export function Login() {
  const { login, loginWithGoogle, loginAsDemoUser, loginAsDemoAdmin, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'jesus@finova.app',
      password: 'password123',
      remember: true,
    },
  });

  const onSubmit = async (values) => {
    try {
      setErrorMessage('');
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Credenciales incorrectas');
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Error al iniciar con Google');
    }
  };

  const handleQuickDemoUser = async () => {
    try {
      await loginAsDemoUser();
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Error al ingresar como demo');
    }
  };

  const handleQuickDemoAdmin = async () => {
    try {
      await loginAsDemoAdmin();
      navigate('/admin');
    } catch (err) {
      setErrorMessage(err.message || 'Error al ingresar como demo admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 p-0.5 shadow-sm group-hover:shadow-glow transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-emerald-400 font-extrabold text-xl">F</span>
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              FINOVA
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ingresa a tu cuenta para gestionar tus finanzas
          </p>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acceso Rápido Modo Demo:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoUser}
              className="p-2 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-emerald-500 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Jesús (Usuario)</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="p-2 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-indigo-500 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
              <span>Admin Finova</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Google Auth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            className="w-full text-xs font-semibold"
            leftIcon={
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.7 0 3 .7 3.9 1.5l2.9-2.9C17 2 14.7 1.2 12 1.2 7.5 1.2 3.7 3.8 1.9 7.6l3.5 2.7C6.3 7.3 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.4 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.9 6.6C.7 9 0 10.9 0 12s.7 3 1.9 5.4l3.5-2.7z"
                />
                <path
                  fill="#34A853"
                  d="M12 22.8c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.7-2.1-6.6-5.1L1.9 15.7C3.7 19.8 7.5 22.8 12 22.8z"
                />
              </svg>
            }
          >
            Continuar con Google
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-dark-card px-3 text-[11px] text-slate-400 uppercase font-bold tracking-wider absolute">
              o con email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu@email.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  {...register('remember')}
                />
                <span>Recordarme</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full shadow-glow"
              isLoading={isSubmitting}
            >
              Iniciar Sesión
            </Button>
          </form>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          ¿No tienes una cuenta aún?{' '}
          <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
