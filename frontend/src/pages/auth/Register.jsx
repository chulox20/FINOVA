import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirma tu contraseña'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export function Register() {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values) => {
    try {
      setErrorMessage('');
      await registerUser(values.fullName, values.email, values.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || 'Error al crear la cuenta');
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Error con Google');
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
            Crear Cuenta Gratis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Toma el control de tu dinero en pocos pasos
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errorMessage}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Cuenta creada con éxito! Redirigiendo...</span>
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
            Registrarse con Google
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-dark-card px-3 text-[11px] text-slate-400 uppercase font-bold tracking-wider absolute">
              o completa tus datos
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nombre Completo"
              placeholder="Ej. Jesús Figueroa"
              required
              leftIcon={<User className="w-4 h-4" />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

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
              placeholder="Mínimo 6 caracteres"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirmar Contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Al registrarte aceptas las políticas de privacidad y control financiero de Finova. Tu rol por defecto será <strong>Usuario</strong>.
            </p>

            <Button
              type="submit"
              variant="primary"
              className="w-full shadow-glow"
              isLoading={isSubmitting}
            >
              Crear Cuenta
            </Button>
          </form>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
