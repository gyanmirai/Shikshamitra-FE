'use client';

import type { ReactNode } from 'react';

import { useCookies } from 'src/hooks/use-cookies';
import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { ACADEMIC_TYPING_SETUP_COOKIE } from './types';

type AcademicLanguageTypingContextValue = {
  isSetupComplete: boolean;
  openSetupGuide: () => void;
  closeSetupGuide: () => void;
  setupGuideOpen: boolean;
  completeSetup: () => void;
  resetSetup: () => void;
  syncSetupState: () => void;
};

const AcademicLanguageTypingContext = createContext<
  AcademicLanguageTypingContextValue | undefined
>(undefined);

export function AcademicLanguageTypingProvider({ children }: { children: ReactNode }) {
  const setupStorage = useCookies<boolean>(
    ACADEMIC_TYPING_SETUP_COOKIE,
    false,
    false,
    { daysUntilExpiration: 180 }
  );
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);

  const syncSetupState = useCallback(() => {
    const cookiePrefix = `${ACADEMIC_TYPING_SETUP_COOKIE}=`;
    const cookieValue = decodeURIComponent(document.cookie)
      .split('; ')
      .find((cookie) => cookie.startsWith(cookiePrefix))
      ?.slice(cookiePrefix.length);

    let cookieState = false;

    if (cookieValue) {
      try {
        cookieState = JSON.parse(cookieValue) === true;
      } catch {
        cookieState = false;
      }
    }

    if (cookieState === setupStorage.state) return;

    if (cookieState) {
      setupStorage.setState(true);
    } else {
      setupStorage.resetState();
    }
  }, [setupStorage]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncSetupState();
    };

    syncSetupState();
    window.addEventListener('focus', syncSetupState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const cookieSyncInterval = window.setInterval(syncSetupState, 1000);

    return () => {
      window.removeEventListener('focus', syncSetupState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(cookieSyncInterval);
    };
  }, [syncSetupState]);

  const value = useMemo<AcademicLanguageTypingContextValue>(
    () => ({
      isSetupComplete: setupStorage.state,
      openSetupGuide: () => setSetupGuideOpen(true),
      closeSetupGuide: () => setSetupGuideOpen(false),
      setupGuideOpen,
      completeSetup: () => {
        setupStorage.setState(true);
        setSetupGuideOpen(false);
      },
      resetSetup: () => setupStorage.resetState(),
      syncSetupState,
    }),
    [setupGuideOpen, setupStorage, syncSetupState]
  );

  return (
    <AcademicLanguageTypingContext.Provider value={value}>
      {children}
    </AcademicLanguageTypingContext.Provider>
  );
}

export function useAcademicLanguageTyping() {
  const context = useContext(AcademicLanguageTypingContext);

  if (!context) {
    throw new Error(
      'useAcademicLanguageTyping must be used inside AcademicLanguageTypingProvider'
    );
  }

  return context;
}
