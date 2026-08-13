import { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/core-leads-contracts';

export type EnrollmentPipelineColor =
  'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';

export type EnrollmentPipelineColumnDefinition = {
  key: AdmissionCrmPipelineColumnKey;
  label: string;
  description: string;
  color: EnrollmentPipelineColor;
};

export const enrollmentPipelineColumns: readonly EnrollmentPipelineColumnDefinition[] = [
  {
    key: AdmissionCrmPipelineColumnKey.NewInquiry,
    label: 'New Inquiry',
    description: 'Newly captured applicants awaiting the first admissions action.',
    color: 'info',
  },
  {
    key: AdmissionCrmPipelineColumnKey.FollowUp,
    label: 'Follow-up',
    description: 'Applicants with an open follow-up or a follow-up stage.',
    color: 'secondary',
  },
  {
    key: AdmissionCrmPipelineColumnKey.ExamPending,
    label: 'Exam Pending',
    description: 'Entrance exam scheduling, attendance, or result entry is pending.',
    color: 'primary',
  },
  {
    key: AdmissionCrmPipelineColumnKey.ExamDone,
    label: 'Exam Done',
    description: 'The exam is complete and an eligibility decision still needs attention.',
    color: 'secondary',
  },
  {
    key: AdmissionCrmPipelineColumnKey.Eligible,
    label: 'Eligible',
    description: 'The applicant is eligible and registration has not started.',
    color: 'success',
  },
  {
    key: AdmissionCrmPipelineColumnKey.RegistrationPending,
    label: 'Registration Pending',
    description: 'Registration is ready to start or is still in progress.',
    color: 'warning',
  },
  {
    key: AdmissionCrmPipelineColumnKey.RegistrationDone,
    label: 'Registration Done',
    description: 'Registration is verified and the next required handoff has not started.',
    color: 'info',
  },
  {
    key: AdmissionCrmPipelineColumnKey.FinanceVerification,
    label: 'Finance Verification',
    description: 'Finance confirmation or an approved waiver is required.',
    color: 'warning',
  },
  {
    key: AdmissionCrmPipelineColumnKey.PlacementPending,
    label: 'Placement Pending',
    description: 'Class capacity and placement work is pending.',
    color: 'error',
  },
  {
    key: AdmissionCrmPipelineColumnKey.ReadyForActivation,
    label: 'Ready for Activation',
    description: 'All admission gates are complete and activation can proceed.',
    color: 'success',
  },
  {
    key: AdmissionCrmPipelineColumnKey.Activated,
    label: 'Activated',
    description: 'The student record has been activated and handed to Student Records.',
    color: 'success',
  },
];

export const getEnrollmentPipelineColumn = (key?: AdmissionCrmPipelineColumnKey) =>
  enrollmentPipelineColumns.find((column) => column.key === key);
