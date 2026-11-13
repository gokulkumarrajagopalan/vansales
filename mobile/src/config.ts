/**
 * Talliffy Van Sales Pro — Mobile Application Configuration
 */

export const APP_CONFIG = {
  appName: 'Talliffy Van Sales',
  companyName: 'Talliffy Distribution & Van Sales Ltd.',
  currencySymbol: '₹',
  currencyCode: 'INR',
  taxName: 'GST',
  defaultTaxRate: 5.0, // 5% default rate or item-specific
  formatCurrency: (amount: number | string | undefined | null): string => {
    const val = typeof amount === 'number' ? amount : parseFloat(String(amount || 0)) || 0;
    return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
};
