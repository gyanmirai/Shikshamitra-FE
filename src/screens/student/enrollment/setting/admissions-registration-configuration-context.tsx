'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { AdmissionsRegistrationController } from './admissions-registration-configuration-controller';

const AdmissionsRegistrationContext = createContext<AdmissionsRegistrationController | null>(null);

export function useAdmissionsRegistrationWorkspace() {
  const value = useContext(AdmissionsRegistrationContext);
  if (!value)
    throw new Error('AdmissionsRegistration workspace must be rendered inside its provider.');
  return value;
}

export function AdmissionsRegistrationProvider({
  value,
  children,
}: {
  value: AdmissionsRegistrationController;
  children: ReactNode;
}) {
  return (
    <AdmissionsRegistrationContext.Provider value={value}>
      {children}
    </AdmissionsRegistrationContext.Provider>
  );
}
