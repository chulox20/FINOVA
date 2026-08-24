import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MonthCalendarView } from '../../components/calendar/MonthCalendarView';
import { DayDetailDrawer } from '../../components/calendar/DayDetailDrawer';
import { TransactionModal } from '../../components/transactions/TransactionModal';
import { Button } from '../../components/ui/Button';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

export function Calendar() {
  const { onOpenCreateTx } = useOutletContext();
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalInitialDate, setModalInitialDate] = useState(null);

  const handleOpenNewTxForDay = (dateStr) => {
    setModalInitialDate(dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Calendario Financiero
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualiza los días en que ocurren tus ingresos y gastos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenCreateTx}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {/* Main Monthly Interactive Calendar */}
      <MonthCalendarView
        onSelectDay={(dayInfo) => setSelectedDay(dayInfo)}
        onOpenNewTxForDay={handleOpenNewTxForDay}
      />

      {/* Day Detail Modal Drawer */}
      <DayDetailDrawer
        isOpen={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        selectedDay={selectedDay}
        onOpenNewTxForDay={handleOpenNewTxForDay}
      />

      {/* New Transaction for specific date Modal */}
      {modalInitialDate && (
        <TransactionModal
          isOpen={Boolean(modalInitialDate)}
          onClose={() => setModalInitialDate(null)}
          initialData={{ transaction_date: modalInitialDate }}
        />
      )}
    </div>
  );
}
