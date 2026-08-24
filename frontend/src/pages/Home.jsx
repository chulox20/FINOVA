import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  PiggyBank,
  PieChart,
  BarChart3,
  Wallet,
  Target,
  Lock,
  Zap,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export function Home() {
  const benefits = [
    {
      icon: BarChart3,
      title: 'Control Financiero',
      desc: 'Registra tus ingresos y gastos en segundos con categorización automática.',
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      icon: Wallet,
      title: 'Todas tus Cuentas',
      desc: 'Bancos, efectivo, tarjetas y ahorros consolidados en un solo balance real.',
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60',
    },
    {
      icon: Target,
      title: 'Metas de Ahorro',
      desc: 'Define objetivos claros, haz aportes periódicos y visualiza tu progreso.',
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      icon: PieChart,
      title: 'Presupuestos Inteligentes',
      desc: 'Establece topes de gasto por categoría y recibe alertas antes de excederte.',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
    },
    {
      icon: TrendingUp,
      title: 'Análisis & Tendencias',
      desc: 'Gráficos interactivos, cálculo de tasa de ahorro y comparativas mensuales.',
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60',
    },
    {
      icon: ShieldCheck,
      title: 'Datos Protegidos',
      desc: 'Seguridad estricta con Row Level Security en PostgreSQL. Solo tú ves tu dinero.',
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-bold animate-pulse-slow shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FINOVA 1.0 — Tu dinero. Más claro que nunca.</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Toma el control total de tus{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              finanzas personales
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
            Organiza tus ingresos, controla tus gastos, crea presupuestos y alcanza tus objetivos financieros desde un solo lugar.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full shadow-glow" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Comenzar gratis
              </Button>
            </Link>

            <a href="#preview" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">
                Ver cómo funciona
              </Button>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              100% Gratis para empezar
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Sin conexión bancaria invasiva
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Tus datos son privados
            </span>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section (Section 5 Spec) */}
      <section id="preview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 pb-20">
        <div className="rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-dark-card border border-slate-300 dark:border-slate-700 shadow-2xl">
          <div className="rounded-2xl bg-white dark:bg-dark-bg p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800">
            {/* Top Bar of Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                  F
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Vista previa de Finova
                  </h3>
                  <p className="text-xs text-slate-400">Panel interactivo en tiempo real</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">
                  Mes de Agosto 2026
                </span>
                <Link to="/dashboard">
                  <Button size="xs" variant="primary">
                    Abrir Demo en Vivo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Spec Dashboard Preview Numbers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Balance total */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Balance Total</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">$12,480.50</p>
                <span className="text-[10px] text-slate-400">+10.5% este mes</span>
              </div>

              {/* Ingresos */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Ingresos</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">+$4,250.00</p>
                <span className="text-[10px] text-emerald-500 font-semibold">+8.2% vs mes anterior</span>
              </div>

              {/* Gastos */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Gastos</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">-$2,130.00</p>
                <span className="text-[10px] text-emerald-500 font-semibold">-4.3% reducción</span>
              </div>

              {/* Ahorro */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Ahorro Neto</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">$2,120.00</p>
                <span className="text-[10px] text-cyan-500 font-semibold">Tasa de ahorro: 49.8%</span>
              </div>
            </div>

            {/* Visual Sample Bar */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <PiggyBank className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Meta "Viaje a Japón": $2,750 ahorrados de $4,000
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Estás al 68.8% de tu meta. Faltan solo $1,250.
                  </p>
                </div>
              </div>

              <Link to="/register">
                <Button size="sm" variant="primary">
                  Probar Finova Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid Section */}
      <section id="beneficios" className="py-16 sm:py-24 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Beneficios Clave
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Todo lo que necesitas para unas finanzas saludables
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Diseñado minuciosamente para darte claridad, control y paz mental financiera.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => (
              <Card key={idx} hoverEffect className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${b.color}`}>
                  <b.icon className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {b.title}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {b.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy Section (Section 40 & 41 Spec) */}
      <section id="seguridad" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-navy-950 text-white p-8 sm:p-12 border border-emerald-500/20 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Privacidad por diseño</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tus finanzas son tuyas. Punto.
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              En Finova no solicitamos contraseñas bancarias ni números de tarjeta completos. Toda tu información se almacena con Row Level Security (RLS) en PostgreSQL, garantizando que nadie salvo tú pueda consultar tus transacciones.
            </p>
            <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Base de datos PostgreSQL aislada con RLS</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Exportación de tus datos en CSV en cualquier momento</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sin venta de datos ni publicidad financiera invasiva</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-base font-bold text-white">Garantía Finova</h5>
                <p className="text-xs text-slate-400">Políticas de seguridad auditadas</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Finova nació para resolver el desorden del dinero cotidiano sin comprometer la privacidad del usuario ni obligarlo a vincular credenciales bancarias reales."
            </p>
            <div className="pt-2">
              <Link to="/register">
                <Button size="md" variant="primary" className="w-full">
                  Crear Cuenta Segura
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action (Section 5 CTA) */}
      <section className="py-16 sm:py-24 text-center max-w-4xl mx-auto px-4 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Empieza a tomar mejores decisiones financieras.
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base">
          Únete a quienes ya tienen el control absoluto de sus ingresos, gastos y metas con Finova.
        </p>
        <div className="pt-2">
          <Link to="/register">
            <Button size="lg" variant="primary" className="shadow-glow" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Comenzar Ahora Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-dark-card transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-500 text-sm">FINOVA</span>
            <span>— Toma el control de tu dinero.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-emerald-500">Iniciar Sesión</Link>
            <Link to="/register" className="hover:text-emerald-500">Registro</Link>
            <Link to="/dashboard" className="hover:text-emerald-500">Dashboard Demo</Link>
          </div>

          <p>© {new Date().getFullYear()} Finova. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
