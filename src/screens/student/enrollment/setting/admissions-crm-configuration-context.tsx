'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { AdmissionsCrmConfigurationController } from './admissions-crm-configuration-controller';

const AdmissionsCrmConfigurationContext =
  createContext<AdmissionsCrmConfigurationController | null>(null);

export function useAdmissionsCrmConfigurationWorkspace() {
  const value = useContext(AdmissionsCrmConfigurationContext);
  if (!value)
    throw new Error('AdmissionsCrmConfiguration workspace must be rendered inside its provider.');
  return value;
}

export function AdmissionsCrmConfigurationProvider({
  value,
  children,
}: {
  value: AdmissionsCrmConfigurationController;
  children: ReactNode;
}) {
  return (
    <AdmissionsCrmConfigurationContext.Provider value={value}>
      {children}
    </AdmissionsCrmConfigurationContext.Provider>
  );
}
