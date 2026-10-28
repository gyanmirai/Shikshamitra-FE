'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useRef, useMemo, useEffect, useContext, createContext } from 'react';

type SetupSession = { isDismissed: (key: string) => boolean; dismiss: (key: string) => void };
const Context = createContext<SetupSession | null>(null);

// The authenticated workspace outlives HR navigation, but never a document refresh.
export function HrSetupSessionProvider({ children }: { children: React.ReactNode }) {
  const dismissed = useRef<string | null>(null);
  const context = useSelector((state: RootState) => {
    const profile = state.auth.user?.profile ?? state.auth.user;
    return JSON.stringify([
      profile?.tenantid ?? state.auth.sessionContext?.tenantId,
      profile?.sub ?? profile?.id,
      state.globalState.currentYear?.id,
    ]);
  });
  useEffect(() => {
    dismissed.current = null;
  }, [context]);
  const value = useMemo(
    () => ({
      isDismissed: (key: string) => {
        if (dismissed.current !== key) dismissed.current = null;
        return dismissed.current === key;
      },
      dismiss: (key: string) => {
        dismissed.current = key;
      },
    }),
    []
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useHrSetupSession() {
  const context = useContext(Context);
  if (!context) throw new Error('HR setup requires the authenticated workspace provider.');
  return context;
}
