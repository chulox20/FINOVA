import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useFinance } from '../../contexts/FinanceContext';
import { AccountCard } from '../../components/accounts/AccountCard';
import { AccountModal } from '../../components/accounts/AccountModal';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Plus, ArrowLeftRight, Wallet, Landmark, TrendingUp, ShieldCheck } from 'lucide-react';

export function Accounts() {
  const { onOpenTransfer } = useOutletContext();
  const { accounts, totalNetWorth, removeAccount, formatMoney } = useFinance();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta cuenta? Sus transacciones asociadas también podrían verse afectadas.')) {
      await removeAccount(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Mis Cuentas Financieras
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administra tus bancos, tarjetas, billeteras y portafolios
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenTransfer}
            leftIcon={<ArrowLeftRight className="w-4 h-4" />}
          >
            Transferir
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Net Worth Summary Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Patrimonio Neto Consolidado
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
            {formatMoney(totalNetWorth)}
          </div>
          <p className="text-xs text-slate-400">
            Suma de los saldos de tus {accounts.length} cuentas registradas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="white"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Añadir otra cuenta
          </Button>
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <EmptyState
          icon="wallet"
          title="No tienes cuentas registradas"
          description="Crea tu primera cuenta para comenzar a registrar balances y movimientos."
          actionLabel="Crear Cuenta"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={(acc) => setEditingAccount(acc)}
              onDelete={handleDelete}
              onTransfer={() => onOpenTransfer()}
            />
          ))}
        </div>
      )}

      {/* Create & Edit Modal */}
      <AccountModal
        isOpen={isCreateModalOpen || Boolean(editingAccount)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAccount(null);
        }}
        initialData={editingAccount}
      />
    </div>
  );
}
