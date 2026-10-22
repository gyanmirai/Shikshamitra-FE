import type { Dayjs } from 'dayjs';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionInquiryManagement } from 'src/redux/student/admissions/admission-inquiry-management-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export type InquiryFollowUpValues = {
  note: string;
  reminderDate: Dayjs | null;
  status: 0 | 2 | 6;
};

export const inquiryFollowUpSchema = Yup.object({
  note: Yup.string().trim().required('Notes are required').max(500, 'Use 500 characters or fewer'),
  status: Yup.number().oneOf([0, 2, 6], 'Select an inquiry status').required('Status is required'),
  reminderDate: Yup.mixed<Dayjs>()
    .nullable()
    .when('status', {
      is: (status: number) => status !== 6,
      then: (schema) =>
        schema.required('Next reminder date is required').test({
          name: 'future-date',
          message: 'Choose a future reminder date',
          skipAbsent: true,
          test: (value) => dayjs.isDayjs(value) && value.isValid() && value.isAfter(dayjs(), 'day'),
        }),
    }),
});

export function inquiryReminderAt(values: InquiryFollowUpValues): string | null {
  if (values.status === 6 || !values.reminderDate?.isValid()) return null;
  return values.reminderDate.startOf('day').toISOString();
}

export function inquiryFollowUpReadOnlyReason(
  inquiry: AdmissionInquiry,
  management: AdmissionInquiryManagement,
  canManage: boolean,
  currentUserId?: string
): string | null {
  if (inquiry.isDuplicate)
    return 'This duplicate inquiry is read-only. Continue the original inquiry.';
  if (inquiry.isTransferred || inquiry.applicationId || management.isLocked)
    return 'This inquiry is read-only because its application has already started.';
  if (!canManage) return 'You do not have permission to add follow-up notes.';
  return null;
}
