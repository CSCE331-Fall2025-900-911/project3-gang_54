'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { LanguageCode } from '../hooks/useTranslation';

interface TranslationContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('en');

  return (
    <TranslationContext.Provider value={{ language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    // Return default values instead of throwing to prevent page crashes
    console.warn('useTranslationContext used outside TranslationProvider, using defaults');
    return { language: 'en' as LanguageCode, setLanguage: () => {} };
  }
  return context;
}

