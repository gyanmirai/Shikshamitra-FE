'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { AdmissionYearSetupController } from './admission-year-setup-controller';

const AdmissionYearSetupContext = createContext<AdmissionYearSetupController | null>(null);

export function useAdmissionYearSetupWorkspace() {
  const value = useContext(AdmissionYearSetupContext);
  if (!value) throw new Error('AdmissionYearSetup workspace must be rendered inside its provider.');
  return value;
}

export function AdmissionYearSetupProvider({
  value,
  children,
}: {
  value: AdmissionYearSetupController;
  children: ReactNode;
}) {
  return (
    <AdmissionYearSetupContext.Provider value={value}>
      {children}
    </AdmissionYearSetupContext.Provider>
  );
}
