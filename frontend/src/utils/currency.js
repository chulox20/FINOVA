/**
 * FINOVA Currency Formatter Utility
 * Centralizes currency formatting across the entire app
 */

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense (USD)', locale: 'en-US', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'es-ES', flag: '🇪🇺' },
  { code: 'VES', symbol: 'Bs.', name: 'Bolívar Venezolano (VES)', locale: 'es-VE', flag: '🇻🇪' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina (GBP)', locale: 'en-GB', flag: '🇬🇧' },
];

/**
 * Format a numeric amount into a localized currency string
 * @param {number|string} amount
 * @param {string} currencyCode ('USD', 'EUR', 'VES', 'GBP')
 * @param {object} options Optional custom overrides
 * @returns {string} e.g. "$12,480.50", "€12.480,50", "Bs. 12.480,50"
 */
export function formatCurrency(amount, currencyCode = 'USD', options = {}) {
  const num = Number(amount);
  if (isNaN(num)) return '$0.00';

  const currencyConfig = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
  const locale = options.locale || currencyConfig.locale;
  const showSign = options.showSign ?? false;

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: options.minimumFractionDigits ?? 2,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    }).format(Math.abs(num));

    let result = formatted;
    
    // Custom handling for VES symbol formatting in some browsers
    if (currencyConfig.code === 'VES' && !formatted.includes('Bs.')) {
      const numberPart = new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Math.abs(num));
      result = `Bs. ${numberPart}`;
    }

    if (num < 0) {
      return `-${result}`;
    }
    if (showSign && num > 0) {
      return `+${result}`;
    }
    return result;
  } catch {
    // Fallback if Intl fails
    const sign = num < 0 ? '-' : showSign && num > 0 ? '+' : '';
    return `${sign}${currencyConfig.symbol}${Math.abs(num).toFixed(2)}`;
  }
}

/**
 * Format a number as percentage
 * @param {number} value e.g. 32.4
 * @param {boolean} showSign whether to prefix positive with +
 * @returns {string} e.g. "+8.2%", "-4.3%"
 */
export function formatPercentage(value, showSign = true) {
  const num = Number(value);
  if (isNaN(num)) return '0%';
  const sign = showSign && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
}
