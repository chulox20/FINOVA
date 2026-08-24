import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

export function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (values) => {
    try {
      setErrorMessage('');
      await resetPassword(values.email);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message || 'Error al solicitar el enlace');
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
            Recuperar Contraseña
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Te enviaremos las instrucciones de restablecimiento
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errorMessage}
            </div>
          )}

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                ¡Correo enviado!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hemos enviado un enlace a tu bandeja de entrada. Revisa tu correo y sigue los pasos para cambiar tu contraseña.
              </p>
              <Link to="/login">
                <Button variant="outline" size="sm" className="mt-2">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Correo Electrónico Registrado"
                type="email"
                placeholder="tu@email.com"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full shadow-glow"
                isLoading={isSubmitting}
              >
                Enviar Enlace de Recuperación
              </Button>
            </form>
          )}
        </Card>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-500 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio de sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
