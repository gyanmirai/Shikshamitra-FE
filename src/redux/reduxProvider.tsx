'use client';

import type { ReactNode } from 'react';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { usePathname } from 'next/navigation';
import { PersistGate } from 'redux-persist/integration/react';
import { publicAdmissionsPaths } from 'src/constants/public-admissions';

import store, { persistor } from './store';
import LoadSession from './auth/load-session';

export default function ReduxProvider({ children }: { children: ReactNode }) {
  const publicRegistration = usePathname() === publicAdmissionsPaths.registration;
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement &&
        event.target.type === 'number' &&
        ['e', 'E', '+', '-'].includes(event.key)
      )
        event.preventDefault();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {!publicRegistration && <LoadSession />}
        {children}
      </PersistGate>
    </Provider>
  );
}
