import type { DocumentStatus } from 'src/redux/student/admissions/admission-document-types';

import { Label } from 'src/components/label';

export const documentStatusLabels: Record<DocumentStatus, string> = {
  notRequired: 'Not applicable',
  missing: 'Missing',
  pendingReview: 'Pending review',
  accepted: 'Accepted',
  rejected: 'Needs resubmission',
  waived: 'Waived',
};
export function DocumentStatusLabel({ status }: { status: DocumentStatus }) {
  const color =
    status === 'accepted'
      ? 'success'
      : status === 'rejected'
        ? 'error'
        : status === 'pendingReview' || status === 'missing'
          ? 'warning'
          : 'default';
  return <Label color={color}>{documentStatusLabels[status]}</Label>;
}
