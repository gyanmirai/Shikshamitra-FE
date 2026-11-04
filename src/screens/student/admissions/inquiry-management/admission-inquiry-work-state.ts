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
  if (!inquiry.managed) return { color: 'default', label: 'Basic Workflow' };
  if (inquiry.hasOverdueFollowUp)
    return {
      color: 'error',
      label: 'Follow-Up Overdue',
      detail: datedDetail(inquiry.nextFollowUpAt),
    };
  if (inquiry.isFirstContactOverdue)
    return {
      color: 'error',
      label: 'First Contact Overdue',
      detail: datedDetail(inquiry.firstContactDueAt),
    };
  if (inquiry.isQualificationOverdue)
    return {
      color: 'error',
      label: 'Qualification Overdue',
      detail: datedDetail(inquiry.qualificationDueAt),
    };
  if (inquiry.nextFollowUpAt)
    return {
      color: 'warning',
      label: `${inquiry.openFollowUpCount} Open Follow-Up${inquiry.openFollowUpCount === 1 ? '' : 's'}`,
      detail: datedDetail(inquiry.nextFollowUpAt, 'Next'),
    };
  if (inquiry.needsFirstContact)
    return {
      color: 'info',
      label: 'Awaiting First Contact',
      detail: datedDetail(inquiry.firstContactDueAt, 'Due'),
    };
  if (inquiry.needsQualification)
    return {
      color: 'info',
      label: 'Awaiting Qualification',
      detail: datedDetail(inquiry.qualificationDueAt, 'Due'),
    };
  return { color: 'default', label: 'Managed Inquiry' };
}
