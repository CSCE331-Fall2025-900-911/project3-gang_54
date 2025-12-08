'use client';

import { ReactNode } from 'react';
import { TranslationProvider } from '../contexts/TranslationContext';
import Navigation from './Navigation';
import AccessibilityToggle from '../AccessibilityToggle';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <TranslationProvider>
      <Navigation />
      <AccessibilityToggle />
      {children}
    </TranslationProvider>
  );
}


