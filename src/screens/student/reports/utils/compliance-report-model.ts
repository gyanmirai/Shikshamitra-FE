import type {
  RecordsReportType,
  RecordsReportInput,
  ComplianceReportType,
} from 'src/redux/student/records/student-record-reports-api';

import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export const complianceReportDefinitions: Record<
  ComplianceReportType,
  { title: string; description: string; columns: string }
> = {
  UdiseBaseline: {
    title: 'Generic UDISE+ Student Export',
    description:
      'Current student baseline and saved identity/compliance statuses for school review. This is not an official UDISE submission file.',
    columns:
      'Student, GR number, board, medium, class, division, masked Aadhaar/APAAR/PEN/UDISE identifiers, verification, consent, sync status and last recorded UDISE export.',
  },
  GujaratCompliance: {
    title: 'Gujarat/GSEB Student Compliance Report',
    description:
      'Existing GSEB student fields and saved identity statuses for reconciliation. Only records whose stored board type is GSEB are included; this is not state certification.',
    columns:
      'Student, GR number, GSEB board, medium, class, division, masked Aadhaar/APAAR/PEN/UDISE identifiers, verification, consent, sync status and last recorded UDISE export.',
  },
  IdentityExceptions: {
    title: 'Aadhaar/APAAR Exception Report',
    description:
      'Includes missing compliance records, Aadhaar or APAAR verification other than Verified, or APAAR consent other than Granted. This reports saved statuses, not an eligibility decision.',
    columns:
      'Student, GR number, board, medium, class, division, masked Aadhaar and APAAR, verification statuses and APAAR consent.',
  },
  EligibilityTracking: {
    title: 'RTE/Scholarship/Caste Certificate Tracking Report',
    description:
      'Existing RTE, scholarship and caste-certificate tracking values. No eligibility or benefit approval is inferred.',
    columns:
      'Student, GR number, board, medium, class, division, recorded RTE flag, scholarship status/scheme, masked application and caste-certificate references, and certificate verification.',
  },
};

const baseTitles: Partial<Record<RecordsReportType, string>> = {
  Directory: 'Student directory',
  Changes: 'Record changes',
  Documents: 'Document issuance',
  Transitions: 'Year-end and transitions',
};
export function studentReportTitle(type: RecordsReportType) {
  return (
    baseTitles[type] ?? complianceReportDefinitions[type as ComplianceReportType]?.title ?? type
  );
}
export function studentReportSourceGrants(type: RecordsReportType): string[] {
  if (type in complianceReportDefinitions)
    return ['Students.Records.StudentList.View', 'Students.IdentityCompliance.View'];
  const grants = {
    Directory: ['Students.Records.StudentList.View'],
    Changes: ['Students.Records.Changes.View'],
    Documents: ['Students.Records.Certificates.View', 'Students.Records.StudentICard.View'],
    Transitions: ['Students.Records.Transitions.View'],
  };
  return grants[type as keyof typeof grants] ?? [];
}
export function reportRegenerationInput(input: RecordsReportInput): RecordsReportInput {
  const { clientKey: _clientKey, skipCount: _skip, maxResultCount: _size, ...scope } = input;
  return { ...scope, skipCount: 0, maxResultCount: 100 };
}
export function reportJobActions(
  status: string,
  canDownload: boolean,
  canGenerate: boolean,
  canReadSource: boolean
) {
  return {
    download: status === 'Completed' && canDownload,
    cancel: canGenerate && ['Queued', 'Generating'].includes(status),
    regenerate:
      canGenerate &&
      canReadSource &&
      ['Completed', 'Failed', 'Expired', 'Cancelled'].includes(status),
  };
}
export function reportCellValue(column: string, value: string | null) {
  if (!value) return '—';
  if (
    [
      'Aadhaar verification',
      'APAAR verification',
      'APAAR consent',
      'UDISE sync status',
      'Caste certificate verification',
      'Scholarship status',
    ].includes(column)
  )
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  return value;
}
export function getStudentReportError(error: unknown, fallback: string) {
  const problem = parseApiProblemDetail(error);
  if (problem.errorCode === 'Students:Records:RestrictedFields')
    return 'The current Records policy restricts the identity fields needed by this report.';
  return problem.detail || fallback;
}
