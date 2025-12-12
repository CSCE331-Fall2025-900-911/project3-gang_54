'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageCode = 'en' | 'es' | 'zh';

interface TranslationContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'sharetea-language-preference';

export function TranslationProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available, otherwise default to 'en'
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'es' || stored === 'zh') {
        return stored;
      }
    }
    return 'en';
  });

  // Persist language preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  const setLanguage = (lang: LanguageCode) => {
    console.log(`[TranslationContext] Language changed from ${language} to ${lang}`);
    setLanguageState(lang);
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
}

