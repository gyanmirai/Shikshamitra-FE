'use client';

import { ApplicantRegistrationView } from './applicant-registration-operations-view';
import { ApplicantRegistrationProvider } from './applicant-registration-operations-context';
import { useApplicantRegistrationController } from './applicant-registration-operations-controller';

type Props = {
  leadId: string;
  academicYearId: string;
  hasRegistration: boolean;
  requestedActionCode?: string;
};

export function ApplicantRegistrationOperations({
  leadId,
  academicYearId,
  hasRegistration,
  requestedActionCode,
}: Props) {
  const controller = useApplicantRegistrationController({
    leadId,
    academicYearId,
    hasRegistration,
    requestedActionCode,
  });

  return (
    <ApplicantRegistrationProvider value={controller}>
      <ApplicantRegistrationView />
    </ApplicantRegistrationProvider>
  );
}
