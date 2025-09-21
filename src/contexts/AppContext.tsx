'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrencyRates, convertPrice, formatPrice, CurrencyRates } from '@/services/currencyService';
import { AuthProvider } from './AuthContext';

interface AppContextType {
  language: 'en' | 'tr';
  currency: 'USD' | 'EUR' | 'TRY';
  currencyRates: CurrencyRates | null;
  setLanguage: (lang: 'en' | 'tr') => void;
  setCurrency: (curr: 'USD' | 'EUR' | 'TRY') => void;
  convertAndFormatPrice: (priceUSD: number) => string;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [language, setLanguageState] = useState<'en' | 'tr'>('tr');
  const [currency, setCurrencyState] = useState<'USD' | 'EUR' | 'TRY'>('TRY');
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'tr' | null;
    const savedCurrency = localStorage.getItem('currency') as 'USD' | 'EUR' | 'TRY' | null;
    
    if (savedLanguage) setLanguageState(savedLanguage);
    if (savedCurrency) setCurrencyState(savedCurrency);
  }, []);

  // Load currency rates
  useEffect(() => {
    const loadCurrencyRates = async () => {
      setIsLoading(true);
      try {
        const rates = await getCurrencyRates();
        setCurrencyRates(rates);
      } catch (error) {
        console.error('Failed to load currency rates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrencyRates();
  }, []);

  const setLanguage = (lang: 'en' | 'tr') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setCurrency = (curr: 'USD' | 'EUR' | 'TRY') => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  };

  const convertAndFormatPrice = (priceUSD: number): string => {
    if (!currencyRates) return `$${priceUSD?.toFixed(2)}`;
    
    const convertedPrice = convertPrice(priceUSD, currency, currencyRates);
    return formatPrice(convertedPrice, currency);
  };

  const value: AppContextType = {
    language,
    currency,
    currencyRates,
    setLanguage,
    setCurrency,
    convertAndFormatPrice,
    isLoading
  };

  return (
    <AppContext.Provider value={value}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppContext.Provider>
  );
}
