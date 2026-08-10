'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { AdmissionsPlaybookController } from './admissions-playbook-configuration-controller';

const AdmissionsPlaybookContext = createContext<AdmissionsPlaybookController | null>(null);

export function useAdmissionsPlaybookWorkspace() {
  const value = useContext(AdmissionsPlaybookContext);
  if (!value) throw new Error('AdmissionsPlaybook workspace must be rendered inside its provider.');
  return value;
}

export function AdmissionsPlaybookProvider({
  value,
  children,
}: {
  value: AdmissionsPlaybookController;
  children: ReactNode;
}) {
  return (
    <AdmissionsPlaybookContext.Provider value={value}>
      {children}
    </AdmissionsPlaybookContext.Provider>
  );
}
