import { AdmissionCrmRouteType } from 'src/redux/student/admissions-crm/admissions-crm-api';

export type ApplicantRouteFieldKey =
  | 'relatedStudentId'
  | 'reference'
  | 'authority'
  | 'allotment'
  | 'round'
  | 'previousSchool'
  | 'previousBoard'
  | 'lastClass'
  | 'deadline';

export type ApplicantRouteValues = Record<ApplicantRouteFieldKey, string>;

export type ApplicantRouteField = {
  key: ApplicantRouteFieldKey;
  label: string;
  type?: 'date';
  helperText?: string;
};

const siblingFields: ApplicantRouteField[] = [
  {
    key: 'relatedStudentId',
    label: 'Sibling student ID',
    helperText: 'The existing student must share the applicant family contact or email.',
  },
];

const returningStudentFields: ApplicantRouteField[] = [
  {
    key: 'relatedStudentId',
    label: 'Former student ID',
  },
];

const transferFields: ApplicantRouteField[] = [
  { key: 'previousSchool', label: 'Previous school' },
  { key: 'previousBoard', label: 'Previous board' },
  { key: 'lastClass', label: 'Last class completed' },
];

const rteFields: ApplicantRouteField[] = [
  { key: 'authority', label: 'Allotment authority' },
  { key: 'allotment', label: 'Allotment number' },
  { key: 'round', label: 'Allotment round' },
  { key: 'deadline', label: 'Admission deadline', type: 'date' },
];

export const emptyApplicantRouteValues = (): ApplicantRouteValues => ({
  relatedStudentId: '',
  reference: '',
  authority: '',
  allotment: '',
  round: '',
  previousSchool: '',
  previousBoard: '',
  lastClass: '',
  deadline: '',
});

export function getApplicantRouteFields(routeType: AdmissionCrmRouteType) {
  switch (routeType) {
    case AdmissionCrmRouteType.SiblingPriority:
      return siblingFields;
    case AdmissionCrmRouteType.ReturningStudent:
      return returningStudentFields;
    case AdmissionCrmRouteType.StaffChild:
      return [
        {
          key: 'reference',
          label: 'Authoritative staff reference',
          helperText: 'Use the employee or HR reference verified by the school.',
        },
      ] satisfies ApplicantRouteField[];
    case AdmissionCrmRouteType.RteEws:
      return rteFields;
    case AdmissionCrmRouteType.Transfer:
    case AdmissionCrmRouteType.Lateral:
    case AdmissionCrmRouteType.Interstate:
      return transferFields;
    case AdmissionCrmRouteType.OverseasReturn:
      return [
        { key: 'authority', label: 'Previous country' },
        { key: 'reference', label: 'Equivalence status or reference' },
      ] satisfies ApplicantRouteField[];
    default:
      return [];
  }
}

export function getRequiredEvidenceCodes(codes: string[] | undefined) {
  return Array.from(
    new Set(
      (codes || [])
        .map((code) => code.trim().toUpperCase())
        .filter(Boolean)
    )
  );
}

export function formatEvidenceCode(code: string) {
  return code
    .toLowerCase()
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildRouteEvidenceReferences(
  codes: string[],
  evidenceValues: Record<string, string>
) {
  return getRequiredEvidenceCodes(codes)
    .map((code) => {
      const reference = evidenceValues[code]?.trim();
      return reference ? `${code}:${reference}` : null;
    })
    .filter((reference): reference is string => Boolean(reference));
}

export function isApplicantRouteInputComplete(
  routeType: AdmissionCrmRouteType,
  values: ApplicantRouteValues,
  evidenceCodes: string[],
  evidenceValues: Record<string, string>
) {
  const hasRouteData = getApplicantRouteFields(routeType).every((field) =>
    Boolean(values[field.key].trim())
  );
  const hasEvidence = getRequiredEvidenceCodes(evidenceCodes).every((code) =>
    Boolean(evidenceValues[code]?.trim())
  );
  return hasRouteData && hasEvidence;
}
