import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Toggle } from '../../components/ui/Toggle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sun, Moon, Laptop, Bell, Shield, Download, Lock, CheckCircle2 } from 'lucide-react';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile, resetPassword } = useAuth();
  const { exportCSV } = useFinance();

  const [budgetAlerts, setBudgetAlerts] = useState(profile?.budget_alerts ?? true);
  const [goalNotifs, setGoalNotifs] = useState(profile?.goal_notifications ?? true);
  const [weeklySummary, setWeeklySummary] = useState(profile?.weekly_summary ?? false);

  const [pwSuccess, setPwSuccess] = useState(false);

  const handleToggleBudget = async (val) => {
    setBudgetAlerts(val);
    await updateProfile({ budget_alerts: val });
  };

  const handleToggleGoal = async (val) => {
    setGoalNotifs(val);
    await updateProfile({ goal_notifications: val });
  };

  const handleToggleWeekly = async (val) => {
    setWeeklySummary(val);
    await updateProfile({ weekly_summary: val });
  };

  const handlePasswordResetRequest = async () => {
    if (profile?.email) {
      await resetPassword(profile.email);
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Configuración
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Personaliza la apariencia, notificaciones y opciones de seguridad
        </p>
      </div>

      {/* 1. Apariencia */}
      <Card className="space-y-4">
        <CardHeader>
          <div>
            <CardTitle>Apariencia del Sistema</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Elige cómo deseas visualizar FINOVA en tus dispositivos
            </p>
          </div>
        </CardHeader>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500" />
            <span className="text-xs font-bold">Claro (Light)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Moon className="w-6 h-6 text-indigo-400" />
            <span className="text-xs font-bold">Oscuro (Dark)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'system'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Laptop className="w-6 h-6 text-cyan-500" />
            <span className="text-xs font-bold">Sistema</span>
          </button>
        </div>
      </Card>

      {/* 2. Notificaciones */}
      <Card className="space-y-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-500" />
            <div>
              <CardTitle>Notificaciones y Alertas</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Controla qué avisos deseas recibir</p>
            </div>
          </div>
        </CardHeader>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 space-y-3">
          <div className="pt-2">
            <Toggle
              label="Alertas de Presupuesto"
              description="Avisar cuando una categoría alcance el 80% o supere el 100% de su límite"
              checked={budgetAlerts}
              onChange={handleToggleBudget}
            />
          </div>

          <div className="pt-3">
            <Toggle
              label="Metas de Ahorro"
              description="Recordatorios de avance y celebraciones al completar tus metas"
              checked={goalNotifs}
              onChange={handleToggleGoal}
            />
          </div>

          <div className="pt-3">
            <Toggle
              label="Resumen Semanal por Email"
              description="Informe consolidado de tus ingresos y gastos de la semana"
              checked={weeklySummary}
              onChange={handleToggleWeekly}
            />
          </div>
        </div>
      </Card>

      {/* 3. Seguridad & Contraseña */}
      <Card className="space-y-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <div>
              <CardTitle>Seguridad de la Cuenta</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Contraseña y sesiones activas</p>
            </div>
          </div>
        </CardHeader>

        {pwSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Enlace de cambio de contraseña enviado a {profile?.email}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-slate-50 dark:bg-dark-input/60 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              Contraseña de acceso
            </span>
            <span className="text-[11px] text-slate-400">
              Solicita un enlace seguro a tu correo para cambiar tu clave
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handlePasswordResetRequest}
            leftIcon={<Lock className="w-3.5 h-3.5" />}
          >
            Cambiar Contraseña
          </Button>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-dark-input/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center">
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">Sesión actual</span>
            <span className="text-[11px] text-slate-400">Navegador Web (Activo ahora)</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
            En línea
          </span>
        </div>
      </Card>

      {/* 4. Exportación de Datos */}
      <Card className="space-y-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-500" />
            <div>
              <CardTitle>Copia de Respaldo y Exportación</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Descarga tus datos financieros completos en formato CSV estándar
              </p>
            </div>
          </div>
        </CardHeader>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Puedes exportar todo tu historial de transacciones en cualquier momento. Compatible con Excel, Google Sheets y Notion.
          </p>

          <Button
            size="sm"
            variant="primary"
            onClick={() => exportCSV()}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar Historial Completo
          </Button>
        </div>
      </Card>
    </div>
  );
}
