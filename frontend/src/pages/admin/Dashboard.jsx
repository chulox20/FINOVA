import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CategoryModal } from '../../components/categories/CategoryModal';
import { IconRenderer } from '../../components/ui/IconRenderer';
import {
  Users,
  UserCheck,
  Tags,
  Activity,
  Plus,
  Edit,
  Trash2,
  Lock,
  Server,
  CreditCard,
  Target,
} from 'lucide-react';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [defaultCategories, setDefaultCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [m, cats] = await Promise.all([
        adminService.getAdminMetrics().catch(() => null),
        adminService.getDefaultCategories().catch(() => []),
      ]);
      setMetrics(m);
      setDefaultCategories(cats || []);
    } catch (err) {
      console.error('Error loading admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteCategory = async (id) => {
    if (confirm('¿Eliminar esta categoría predeterminada del sistema?')) {
      await adminService.deleteDefaultCategory(id);
      await loadAdminData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Panel de Administración
            </h2>
            <Badge variant="purple" size="sm">
              Admin Shield
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas globales y gestión de categorías predeterminadas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCategoryModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva Categoría Base
          </Button>
        </div>
      </div>

      {/* Privacy Notice Banner (Section 27 Spec) */}
      <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl flex items-start gap-3 text-xs">
        <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-indigo-900 dark:text-indigo-200">
            Aislamiento de Privacidad Activo (JWT & PostgreSQL)
          </span>
          <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed">
            Por diseño de seguridad y respeto a la privacidad de los usuarios, este panel muestra únicamente métricas agregadas del sistema y no permite inspeccionar balances individuales ni transacciones personales de otros usuarios.
          </p>
        </div>
      </div>

      {/* Real PostgreSQL KPI Cards (Section 32 & 33) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Usuarios Totales</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics?.totalUsers ?? '0'}
          </p>
          <span className="text-[11px] text-emerald-500 font-semibold">Registrados en BD</span>
        </Card>

        {/* Active Users (Last 30 days via last_seen_at) */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Usuarios Activos (30d)</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics?.activeUsersMonthly ?? '0'}
          </p>
          <span className="text-[11px] text-slate-400">Medido por last_seen_at</span>
        </Card>

        {/* Total Transactions */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Transacciones Totales</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics?.totalTransactionsCount ?? '0'}
          </p>
          <span className="text-[11px] text-cyan-500 font-semibold">Procesadas en BD</span>
        </Card>

        {/* Total Accounts */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Cuentas Creadas</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics?.totalAccountsCount ?? '0'}
          </p>
          <span className="text-[11px] text-purple-400">Cuentas bancarias</span>
        </Card>

        {/* Completed Goals */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Metas Cumplidas</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics?.completedGoalsCount ?? '0'}
          </p>
          <span className="text-[11px] text-amber-500 font-semibold">100% completadas</span>
        </Card>
      </div>

      {/* System Status and Default Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-500" />
              <CardTitle>Estado del Servidor</CardTitle>
            </div>
            <Badge variant="emerald" size="xs" dot>
              {metrics?.serverStatus || 'Operativo'}
            </Badge>
          </CardHeader>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Arquitectura:</span>
              <span className="font-bold text-slate-900 dark:text-white">REST API (Express + JWT)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Motor de Base de Datos:</span>
              <span className="font-bold text-emerald-500">{metrics?.databaseEngine || 'PostgreSQL'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Transacciones ACID:</span>
              <span className="font-bold text-emerald-500">Activas (BEGIN ... COMMIT)</span>
            </div>
          </div>
        </Card>

        {/* Default Categories Manager */}
        <Card className="lg:col-span-2 space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Categorías Predeterminadas del Sistema</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Categorías base disponibles para todos los usuarios nuevos
              </p>
            </div>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setIsCategoryModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Añadir Base
            </Button>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {defaultCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-input/50 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: cat.color || '#64748b' }}
                  >
                    <IconRenderer name={cat.icon || 'tag'} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {cat.type}
                    </span>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(cat)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Category Creation / Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen || Boolean(editingCategory)}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
          loadAdminData();
        }}
        initialData={editingCategory}
      />
    </div>
  );
}
