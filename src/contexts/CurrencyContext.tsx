import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '@/services/userService';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string, persist?: boolean) => Promise<void>;
  formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

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

// Global currency utility functions
export const globalCurrencyUtils = {
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

  format: (amount: number, currency?: string): string => {
    const currencyCode = currency || globalCurrencyUtils.get();
    try {
      const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
      const format = currencyFormats[currencyCode] || currencyFormats.INR;
      return new Intl.NumberFormat(locale, format).format(amount);
    } catch (error) {
      const symbol = currencySymbols[currencyCode] || '₹';
      return `${symbol}${amount.toLocaleString()}`;
    }
  }
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>(() => globalCurrencyUtils.get());

  useEffect(() => {
    const handleCurrencyChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ currency: string }>;
      setCurrencyState(customEvent.detail.currency);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, []);

  const setCurrency = async (newCurrency: string, persist: boolean = true): Promise<void> => {
    setCurrencyState(newCurrency);
    globalCurrencyUtils.set(newCurrency);

    if (persist) {
      try {
        // Fetch current user data to preserve existing preferences
        const currentUser = await userService.getCurrentUser();
        const currentPreferences = currentUser.data.user.profile?.preferences || {};
        
        const settingsData = {
          profile: {
            preferences: {
              ...currentPreferences,
              currency: newCurrency
            }
          }
        };
        await userService.updateUserPreferences(settingsData);
      } catch (error) {
        console.warn('Failed to persist currency to backend, saved locally:', error);
      }
    }
  };

  const formatPrice = (amount: number): string => {
    return globalCurrencyUtils.format(amount, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
