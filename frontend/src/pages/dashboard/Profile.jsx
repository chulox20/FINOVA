import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Mail, Phone, Globe, CheckCircle2, ShieldCheck, Camera } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';

const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email(),
  phone: z.string().optional(),
  currency: z.enum(['USD', 'EUR', 'VES', 'GBP']),
  decimal_format: z.enum(['dot', 'comma']),
  week_start: z.enum(['monday', 'sunday']),
});

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export function Profile() {
  const { profile, updateProfile, isAdmin } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || AVATAR_OPTIONS[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      currency: profile?.currency || 'USD',
      decimal_format: profile?.decimal_format || 'dot',
      week_start: profile?.week_start || 'monday',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        currency: profile.currency || 'USD',
        decimal_format: profile.decimal_format || 'dot',
        week_start: profile.week_start || 'monday',
      });
      if (profile.avatar_url) setSelectedAvatar(profile.avatar_url);
    }
  }, [profile, reset]);

  const onSubmit = async (values) => {
    try {
      await updateProfile({
        ...values,
        avatar_url: selectedAvatar,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Error al actualizar el perfil');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Mi Perfil
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Gestiona tus datos personales, moneda preferida y formato de visualización
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5" />
          <span>Perfil actualizado correctamente.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Card */}
        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Foto de Perfil</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecciona un avatar representativo para tu cuenta
              </p>
            </div>
            <Badge variant={isAdmin ? 'purple' : 'emerald'} size="sm">
              Rol: {isAdmin ? 'Administrador' : 'Usuario'}
            </Badge>
          </CardHeader>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={selectedAvatar}
              alt="Avatar principal"
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-md"
            />

            <div className="space-y-2">
              <span className="text-xs text-slate-500 block">Elige un avatar:</span>
              <div className="flex items-center gap-3">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-transform ${
                      selectedAvatar === url
                        ? 'border-emerald-500 scale-110 shadow-sm'
                        : 'border-transparent hover:scale-105 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Details */}
        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Información Personal</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Tus datos básicos de contacto</p>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo"
              required
              leftIcon={<User className="w-4 h-4" />}
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Correo Electrónico"
              type="email"
              disabled
              helperText="El correo no se puede cambiar directamente"
              leftIcon={<Mail className="w-4 h-4" />}
              {...register('email')}
            />

            <Input
              label="Teléfono (Opcional)"
              placeholder="+58 412 1234567"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </Card>

        {/* Financial Preferences */}
        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Preferencias Financieras</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Configura cómo se mostrarán los montos y fechas en toda la app
              </p>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Moneda Principal"
              required
              error={errors.currency?.message}
              {...register('currency')}
            >
              {SUPPORTED_CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Formato Decimal"
              error={errors.decimal_format?.message}
              {...register('decimal_format')}
            >
              <option value="dot">Punto ($1,250.50)</option>
              <option value="comma">Coma ($1.250,50)</option>
            </Select>

            <Select
              label="La semana comienza en"
              error={errors.week_start?.message}
              {...register('week_start')}
            >
              <option value="monday">Lunes</option>
              <option value="sunday">Domingo</option>
            </Select>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            Guardar Cambios del Perfil
          </Button>
        </div>
      </form>
    </div>
  );
}
