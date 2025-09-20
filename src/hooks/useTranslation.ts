'use client';

import { useApp } from '@/contexts/AppContext';
import { translations, TranslationKeys } from '@/locales';

export function useTranslation() {
  const { language } = useApp();
  
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    let result = value || key;
    
    // Handle string interpolation
    if (params) {
      Object.keys(params).forEach(param => {
        result = result.replace(`{${param}}`, params[param]);
      });
    }
    
    return result;
  };

  return { t };
}
