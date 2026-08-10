'use client';

import { ApplicantFinalAdmissionView } from './applicant-final-admission-operations-view';
import { ApplicantFinalAdmissionProvider } from './applicant-final-admission-operations-context';
import { useApplicantFinalAdmissionController } from './applicant-final-admission-operations-controller';

type Props = {
  leadId: string;
  academicYearId: string;
};

export function ApplicantFinalAdmissionOperations({ leadId, academicYearId }: Props) {
  const controller = useApplicantFinalAdmissionController({ leadId, academicYearId });

  return (
    <ApplicantFinalAdmissionProvider value={controller}>
      <ApplicantFinalAdmissionView />
    </ApplicantFinalAdmissionProvider>
  );
}
