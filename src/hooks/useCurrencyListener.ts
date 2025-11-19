import { useEffect, useState } from 'react';

export const useCurrencyListener = () => {
  const [currency, setCurrency] = useState<string>('INR');
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    // Listen for currency changes from Settings page
    const handleCurrencyChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ currency: string }>;
      setCurrency(customEvent.detail.currency);
      // Trigger a rerender
      setUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);

    // Load initial currency from localStorage
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.preferences?.currency) {
          setCurrency(settings.preferences.currency);
        }
      }
    } catch (error) {
      console.warn('Error loading currency from localStorage:', error);
    }

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, []);

  return { currency, updateTrigger };
};
