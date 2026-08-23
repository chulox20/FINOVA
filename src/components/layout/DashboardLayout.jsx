import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { TransactionModal } from '../transactions/TransactionModal';
import { TransferModal } from '../accounts/TransferModal';

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const location = useLocation();

  // Determine title and subtitle based on route
  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { title: 'Dashboard', subtitle: 'Resumen general de tus finanzas' };
    if (path === '/transactions') return { title: 'Movimientos', subtitle: 'Historial y control de transacciones' };
    if (path === '/accounts') return { title: 'Cuentas', subtitle: 'Gestiona tus cuentas bancarias y billeteras' };
    if (path === '/categories') return { title: 'Categorías', subtitle: 'Organiza tus ingresos y gastos' };
    if (path === '/budgets') return { title: 'Presupuestos', subtitle: 'Límites de gasto y alertas inteligentes' };
    if (path === '/goals') return { title: 'Metas de Ahorro', subtitle: 'Alcanza tus objetivos financieros' };
    if (path === '/analytics') return { title: 'Análisis Financiero', subtitle: 'Evolución, comparaciones y métricas' };
    if (path === '/calendar') return { title: 'Calendario Financiero', subtitle: 'Visualiza tus gastos e ingresos día a día' };
    if (path === '/profile') return { title: 'Mi Perfil', subtitle: 'Información personal y preferencias de moneda' };
    if (path === '/settings') return { title: 'Configuración', subtitle: 'Seguridad, notificaciones y apariencia' };
    if (path === '/admin') return { title: 'Panel de Administración', subtitle: 'Métricas del sistema y configuración global' };
    return { title: 'FINOVA', subtitle: 'Toma el control de tu dinero' };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onOpenNewTx={() => setIsTxModalOpen(true)}
          onOpenTransfer={() => setIsTransferModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          <Outlet context={{ onOpenCreateTx: () => setIsTxModalOpen(true), onOpenTransfer: () => setIsTransferModalOpen(true) }} />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav onOpenCreateTx={() => setIsTxModalOpen(true)} />

      {/* Global Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
}
