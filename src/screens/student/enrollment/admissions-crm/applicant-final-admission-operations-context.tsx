'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { ApplicantFinalAdmissionController } from './applicant-final-admission-operations-controller';

const ApplicantFinalAdmissionContext = createContext<ApplicantFinalAdmissionController | null>(
  null
);

export function useApplicantFinalAdmissionWorkspace() {
  const value = useContext(ApplicantFinalAdmissionContext);
  if (!value)
    throw new Error('ApplicantFinalAdmission workspace must be rendered inside its provider.');
  return value;
}

export function ApplicantFinalAdmissionProvider({
  value,
  children,
}: {
  value: ApplicantFinalAdmissionController;
  children: ReactNode;
}) {
  return (
    <ApplicantFinalAdmissionContext.Provider value={value}>
      {children}
    </ApplicantFinalAdmissionContext.Provider>
  );
}
