import type {
  CertificateType,
  CertificatePreviewInput,
} from 'src/redux/student/records/student-record-documents-api';

import { GlobalIcons } from 'src/utils/icons';

export const certificateChoices: {
  type: CertificateType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    type: 1,
    label: 'Bonafide',
    icon: GlobalIcons.documentIcon,
    description: 'Proof of student enrolment',
  },
  {
    type: 2,
    label: 'Character',
    icon: GlobalIcons.approvedIcon,
    description: 'Verified conduct particulars',
  },
  {
    type: 4,
    label: 'First Trial',
    icon: GlobalIcons.admissionDetails,
    description: 'Verified first trial particulars',
  },
  {
    type: 3,
    label: 'Leaving',
    icon: GlobalIcons.exit,
    description: 'Requires an eligible school exit case',
  },
];

export type CertificateFormValues = {
  issueDate: string;
  reason: string;
  particulars: string;
  exitCases: Record<string, string>;
};

export function certificateRequest(
  studentId: string,
  certificateType: CertificateType,
  values: CertificateFormValues,
  expectedAcademicYearId?: string
): CertificatePreviewInput {
  return {
    studentId,
    expectedAcademicYearId,
    certificateType,
    issueDate: values.issueDate,
    certificateFields: {
      Reason: values.reason.trim(),
      ...(certificateType === 2
        ? { Conduct: values.particulars.trim() }
        : certificateType === 4
          ? { FirstTrialDetails: values.particulars.trim() }
          : {}),
    },
    ...(certificateType === 3 ? { transitionId: values.exitCases[studentId] } : {}),
  };
}

export function certificateFailureMessage(error: unknown, fallback: string): string {
  const code = (error as { data?: { error?: { code?: string } } } | null)?.data?.error?.code;
  const messages: Record<string, string> = {
    'Students:Records:CertificateYearMismatch':
      'This student’s current academic year differs from the selected year. Select their current year to generate a certificate; saved history remains available.',
    'Students:Records:CertificateDisabled':
      'This certificate type is disabled by the school’s document policy.',
    'Students:Records:LeavingExitNotReady':
      'The exit case is not ready for a Leaving certificate under the school’s document policy.',
    'Students:Records:LeavingExitInvalid': 'Select a valid exit case for this student.',
    'Students:Records:DocumentFieldsRestricted':
      'The student’s identity is restricted. You cannot generate this certificate.',
  };
  return (code && messages[code]) || fallback;
}
