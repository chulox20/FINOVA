/**
 * FINOVA Export Utility
 * Handles generating and downloading CSV files of transactions and reports
 */

/**
 * Export transactions to CSV file
 * Matches specification format: fecha,descripcion,categoria,tipo,monto
 * @param {Array} transactions
 * @param {string} filename
 */
export function exportTransactionsToCSV(transactions = [], filename = 'finova-movimientos.csv') {
  if (!transactions || transactions.length === 0) {
    alert('No hay movimientos para exportar.');
    return;
  }

  const headers = ['fecha', 'descripcion', 'categoria', 'cuenta', 'tipo', 'monto', 'notas'];

  const rows = transactions.map(t => {
    const date = t.transaction_date || '';
    const desc = `"${(t.description || '').replace(/"/g, '""')}"`;
    const cat = `"${(t.category?.name || t.category_name || 'Sin categoría').replace(/"/g, '""')}"`;
    const acc = `"${(t.account?.name || t.account_name || 'Cuenta').replace(/"/g, '""')}"`;
    const type = t.type || 'expense';
    const amount = Number(t.amount) || 0;
    const notes = `"${(t.notes || '').replace(/"/g, '""')}"`;

    return [date, desc, cat, acc, type, amount, notes].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
