import type { LabelColor } from 'src/components/label';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { fDateTime } from 'src/utils/format-time';

export type AdmissionInquiryWorkState = {
  color: LabelColor;
  label: string;
  detail?: string;
};

const datedDetail = (value?: string | null, prefix?: string) => {
  if (!value) return undefined;
  const formatted = fDateTime(value);
  if (!formatted) return undefined;
  return prefix ? `${prefix} ${formatted}` : formatted;
};

export function inquiryWorkState(inquiry: AdmissionInquiry): AdmissionInquiryWorkState {
  if (!inquiry.managed) return { color: 'default', label: 'Basic workflow' };
  if (inquiry.hasOverdueFollowUp)
    return {
      color: 'error',
      label: 'Follow-up overdue',
      detail: datedDetail(inquiry.nextFollowUpAt),
    };
  if (inquiry.isFirstContactOverdue)
    return {
      color: 'error',
      label: 'First contact overdue',
      detail: datedDetail(inquiry.firstContactDueAt),
    };
  if (inquiry.isQualificationOverdue)
    return {
      color: 'error',
      label: 'Qualification overdue',
      detail: datedDetail(inquiry.qualificationDueAt),
    };
  if (inquiry.nextFollowUpAt)
    return {
      color: 'warning',
      label: `${inquiry.openFollowUpCount} open follow-up${inquiry.openFollowUpCount === 1 ? '' : 's'}`,
      detail: datedDetail(inquiry.nextFollowUpAt, 'Next'),
    };
  if (inquiry.needsFirstContact)
    return {
      color: 'info',
      label: 'Awaiting first contact',
      detail: datedDetail(inquiry.firstContactDueAt, 'Due'),
    };
  if (inquiry.needsQualification)
    return {
      color: 'info',
      label: 'Awaiting qualification',
      detail: datedDetail(inquiry.qualificationDueAt, 'Due'),
    };
  return { color: 'default', label: 'Managed inquiry' };
}
