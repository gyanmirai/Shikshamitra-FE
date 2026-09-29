import type {
  AdmissionInquirySource,
  AdmissionInquiryStatus,
} from 'src/redux/student/admissions/admission-inquiries-api';

export const INQUIRY_STATUS_OPTIONS: Array<{
  value: AdmissionInquiryStatus;
  label: string;
}> = [
  { value: 0, label: 'New' },
  { value: 1, label: 'Contacted' },
  { value: 2, label: 'Interested' },
  { value: 3, label: 'Follow-up' },
  { value: 4, label: 'Application started' },
  { value: 5, label: 'Converted' },
  { value: 6, label: 'Not interested' },
  { value: 7, label: 'Lost' },
  { value: 8, label: 'Duplicate' },
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
  INQUIRY_STATUS_OPTIONS.find((option) => option.value === Number(value))?.label ?? 'Unknown';

export const inquirySourceLabel = (value: unknown) =>
  INQUIRY_SOURCE_OPTIONS.find((option) => option.value === Number(value))?.label ?? 'Unknown';
