import type {
  AdmissionInquiry,
  AdmissionInquirySource,
  AdmissionInquiryStatus,
} from 'src/redux/student/admissions/admission-inquiries-api';

export const INQUIRY_STATUS_OPTIONS: Array<{
  value: AdmissionInquiryStatus;
  label: string;
}> = [
  { value: 0, label: 'Pending' },
  { value: 2, label: 'Interested' },
  { value: 6, label: 'Not interested' },
];

export const INQUIRY_SOURCE_OPTIONS: Array<{
  value: AdmissionInquirySource;
  label: string;
}> = [
  { value: 0, label: 'Website' },
  { value: 1, label: 'Walk-in' },
  { value: 2, label: 'Phone' },
  { value: 3, label: 'Referral' },
  { value: 4, label: 'Campaign' },
  { value: 5, label: 'Import' },
  { value: 6, label: 'WhatsApp' },
  { value: 7, label: 'Existing parent' },
  { value: 8, label: 'Manual' },
  { value: 9, label: 'Other' },
  { value: 10, label: 'QR code' },
  { value: 11, label: 'School fair' },
  { value: 12, label: 'Social media' },
];

export const inquiryStatusLabel = (value: unknown) =>
  INQUIRY_STATUS_OPTIONS.find((option) => option.value === normalizeInquiryStatus(value))?.label ??
  'Pending';

export const normalizeInquiryStatus = (value: unknown): 0 | 2 | 6 => {
  const status = Number(value);
  if ([2, 4, 5].includes(status)) return 2;
  if ([6, 7, 8].includes(status)) return 6;
  return 0;
};

export const inquirySourceLabel = (value: unknown) =>
  INQUIRY_SOURCE_OPTIONS.find((option) => option.value === Number(value))?.label ?? 'Unknown';

export function buildAdmissionInquiryRowOptions(rows: AdmissionInquiry[]) {
  const counsellors = new Map<string, string>();
  const offerings = new Map<string, string>();
  rows.forEach((row) => {
    if (row.assignedCounsellorId)
      counsellors.set(
        row.assignedCounsellorId,
        row.assignedCounsellorName || 'Assigned counsellor'
      );
    if (row.admissionOfferingId)
      offerings.set(
        row.admissionOfferingId,
        `${row.admissionOfferingCode || 'Admission offering'} · ${row.admissionCycleName}`
      );
  });
  return {
    counsellorNames: Object.fromEntries(counsellors),
    counsellorOptions: Array.from(counsellors, ([value, label]) => ({ value, label })),
    offeringOptions: Array.from(offerings, ([value, label]) => ({ value, label })),
  };
}
