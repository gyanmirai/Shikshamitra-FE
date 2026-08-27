import type { AdmissionApplicationStatus } from 'src/redux/student/admissions/admission-applications-api';

export const ADMISSION_APPLICATION_STATUS_LABELS: Record<AdmissionApplicationStatus, string> = {
  0: 'Draft',
  1: 'Submitted',
  2: 'Withdrawn',
  3: 'Rejected',
  4: 'In review',
  5: 'Waitlisted',
  6: 'Approved',
  7: 'Offer issued',
  8: 'Offer accepted',
  9: 'Offer declined',
  10: 'Enrolled',
};

export function getAdmissionApplicationStatusLabel(status: number): string {
  return ADMISSION_APPLICATION_STATUS_LABELS[status as AdmissionApplicationStatus] ?? 'Unknown';
}

export function getAdmissionApplicationStatusColor(
  status: AdmissionApplicationStatus,
): 'default' | 'info' | 'success' | 'warning' | 'error' {
  if (status === 3 || status === 9) return 'error';
  if (status === 5) return 'warning';
  if (status === 6 || status === 8 || status === 10) return 'success';
  if (status === 1 || status === 4 || status === 7) return 'info';
  return 'default';
}

