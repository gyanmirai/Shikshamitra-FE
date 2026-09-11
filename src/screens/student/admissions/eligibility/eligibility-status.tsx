import type { EligibilityStatus } from 'src/redux/student/admissions/admission-eligibility-types';

import { Label } from 'src/components/label';

const labels: Record<EligibilityStatus, string> = {
  notChecked: 'Not checked',
  eligible: 'Eligible',
  ineligible: 'Ineligible',
  needsInformation: 'More information needed',
  exceptionApproved: 'Exception approved',
};
export function EligibilityStatusLabel({
  status,
  stale = false,
}: {
  status: EligibilityStatus;
  stale?: boolean;
}) {
  const color =
    stale || status === 'needsInformation'
      ? 'warning'
      : status === 'eligible' || status === 'exceptionApproved'
        ? 'success'
        : status === 'ineligible'
          ? 'error'
          : 'default';
  return <Label color={color}>{stale ? 'Out of date' : labels[status]}</Label>;
}
