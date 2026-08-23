/**
 * FINOVA Date Utilities
 * Friendly date formatting, period ranges, calendar helpers
 */

import { format, formatDistanceToNow, isToday, isYesterday, parseISO, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format date string into human friendly format
 * @param {string|Date} date
 * @param {string} formatStr e.g. "dd MMM yyyy"
 * @returns {string} e.g. "22 Ago 2026"
 */
export function formatDate(date, formatStr = 'dd MMM yyyy') {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, formatStr, { locale: es });
  } catch {
    return String(date);
  }
}

/**
 * Relative date description e.g. "Hoy", "Ayer", "hace 3 días"
 */
export function formatRelativeDate(date) {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isToday(d)) return 'Hoy';
    if (isYesterday(d)) return 'Ayer';
    return formatDistanceToNow(d, { addSuffix: true, locale: es });
  } catch {
    return formatDate(date, 'dd MMM');
  }
}

/**
 * Get date range for standard dashboard periods
 * @param {string} period 'this_month' | 'last_3_months' | 'this_year' | 'all'
 * @returns {{ startDate: string, endDate: string }}
 */
export function getPeriodRange(period = 'this_month') {
  const now = new Date();
  let start;
  let end = new Date();

  switch (period) {
    case 'this_month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'last_3_months':
      start = startOfMonth(subMonths(now, 2));
      end = endOfMonth(now);
      break;
    case 'this_year':
      start = startOfYear(now);
      end = endOfYear(now);
      break;
    case 'last_month':
      start = startOfMonth(subMonths(now, 1));
      end = endOfMonth(subMonths(now, 1));
      break;
    default:
      start = startOfMonth(now);
      end = endOfMonth(now);
  }

  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  };
}

/**
 * Get current ISO date (YYYY-MM-DD)
 */
export function getCurrentISODate() {
  return format(new Date(), 'yyyy-MM-dd');
}
