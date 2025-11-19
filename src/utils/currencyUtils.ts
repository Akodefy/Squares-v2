// Global currency utility - can be imported anywhere without context
// This utility provides currency management across all portals (Customer, Vendor, Admin)

const CURRENCY_STORAGE_KEY = 'app_currency_preference';

const currencySymbols: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

const currencyFormats: Record<string, Intl.NumberFormatOptions> = {
  INR: { style: 'currency', currency: 'INR', maximumFractionDigits: 0 },
  USD: { style: 'currency', currency: 'USD', minimumFractionDigits: 2 },
  EUR: { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 },
  GBP: { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }
};

export const currencyUtils = {
  /**
   * Get current currency from localStorage
   */
  get: (): string => {
    try {
      // Priority 1: Direct currency key
      const directCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (directCurrency) return directCurrency;

      // Priority 2: userSettings
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.preferences?.currency) {
          return settings.preferences.currency;
        }
      }
    } catch (error) {
      console.warn('Error reading currency from localStorage:', error);
    }
    return 'INR';
  },

  /**
   * Set currency in localStorage and dispatch event
   */
  set: (currency: string): void => {
    try {
      // Save to direct currency key
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
      
      // Also update userSettings for compatibility
      const savedSettings = localStorage.getItem('userSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.preferences = settings.preferences || {};
      settings.preferences.currency = currency;
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Dispatch event for all listeners
      window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency } }));
    } catch (error) {
      console.error('Error saving currency to localStorage:', error);
    }
  },

  /**
   * Format amount with currency symbol
   */
  format: (amount: number, currency?: string): string => {
    const currencyCode = currency || currencyUtils.get();
    try {
      const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
      const format = currencyFormats[currencyCode] || currencyFormats.INR;
      return new Intl.NumberFormat(locale, format).format(amount);
    } catch (error) {
      const symbol = currencySymbols[currencyCode] || '₹';
      return `${symbol}${amount.toLocaleString()}`;
    }
  },

  /**
   * Get currency symbol
   */
  getSymbol: (currency?: string): string => {
    const currencyCode = currency || currencyUtils.get();
    return currencySymbols[currencyCode] || '₹';
  },

  /**
   * Format price for property listings (with condensed notation for large values)
   */
  formatPrice: (price: number, listingType?: string, currency?: string): string => {
    const currencyCode = currency || currencyUtils.get();
    const symbol = currencyUtils.getSymbol(currencyCode);

    // For INR, use lakh/crore notation
    if (currencyCode === 'INR') {
      if (listingType === 'rent') return `${symbol}${price.toLocaleString("en-IN")}/month`;
      if (listingType === 'lease') return `${symbol}${price.toLocaleString("en-IN")}/year`;
      if (price >= 10000000) return `${symbol}${(price / 10000000).toFixed(1)} Cr`;
      if (price >= 100000) return `${symbol}${(price / 100000).toFixed(1)} Lac`;
      return `${symbol}${price.toLocaleString("en-IN")}`;
    }

    // For other currencies, use standard notation
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(price);

    if (listingType === 'rent') return `${formatted}/month`;
    if (listingType === 'lease') return `${formatted}/year`;
    return formatted;
  },

  /**
   * Listen for currency changes
   */
  onChange: (callback: (currency: string) => void): (() => void) => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ currency: string }>;
      callback(customEvent.detail.currency);
    };

    window.addEventListener('currencyChanged', handler);

    // Return cleanup function
    return () => {
      window.removeEventListener('currencyChanged', handler);
    };
  },

  /**
   * Get all available currencies
   */
  getAvailableCurrencies: (): Array<{ code: string; name: string; symbol: string }> => {
    return [
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' }
    ];
  }
};

export default currencyUtils;
