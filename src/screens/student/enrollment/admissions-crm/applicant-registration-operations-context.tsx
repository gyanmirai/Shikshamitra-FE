'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { ApplicantRegistrationController } from './applicant-registration-operations-controller';

const ApplicantRegistrationContext = createContext<ApplicantRegistrationController | null>(null);

export function useApplicantRegistrationWorkspace() {
  const value = useContext(ApplicantRegistrationContext);
  if (!value)
    throw new Error('ApplicantRegistration workspace must be rendered inside its provider.');
  return value;
}

export function ApplicantRegistrationProvider({
  value,
  children,
}: {
  value: ApplicantRegistrationController;
  children: ReactNode;
}) {
  return (
    <ApplicantRegistrationContext.Provider value={value}>
      {children}
    </ApplicantRegistrationContext.Provider>
  );
}
