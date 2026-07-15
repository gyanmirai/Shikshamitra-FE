import {
  AdmissionCrmRouteType,
  AdmissionCrmFinanceState,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmActivationStatus,
  AdmissionCrmRegistrationStatus,
  AdmissionCrmServiceHandoffStatus,
  AdmissionCrmRegistrationFeeStatus,
  AdmissionCrmRouteEligibilityStatus,
  AdmissionCrmApplicantDocumentStatus,
  AdmissionCrmAdmissionDecisionStatus,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

export const formatEnumLabel = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .trim();

const enumLabel = <T extends number>(source: Record<string, string | number>, value?: T | null) => {
  if (value == null) return 'Not started';
  const raw = source[value];
  return typeof raw === 'string' ? formatEnumLabel(raw) : 'Not available';
};

export const getRegistrationStatusLabel = (value?: AdmissionCrmRegistrationStatus | null) =>
  enumLabel(AdmissionCrmRegistrationStatus, value);

export const getRegistrationFeeStatusLabel = (value?: AdmissionCrmRegistrationFeeStatus | null) =>
  enumLabel(AdmissionCrmRegistrationFeeStatus, value);

export const getDocumentStatusLabel = (value?: AdmissionCrmApplicantDocumentStatus | null) =>
  enumLabel(AdmissionCrmApplicantDocumentStatus, value);

export const getOfferStatusLabel = (value?: AdmissionCrmSeatOfferStatus | null) =>
  enumLabel(AdmissionCrmSeatOfferStatus, value);

export const getDecisionStatusLabel = (value?: AdmissionCrmAdmissionDecisionStatus | null) =>
  enumLabel(AdmissionCrmAdmissionDecisionStatus, value);

export const getRouteTypeLabel = (value?: AdmissionCrmRouteType | null) =>
  enumLabel(AdmissionCrmRouteType, value);

export const getRouteStatusLabel = (value?: AdmissionCrmRouteEligibilityStatus | null) =>
  enumLabel(AdmissionCrmRouteEligibilityStatus, value);

export const getFinanceStateLabel = (value?: AdmissionCrmFinanceState | null) =>
  enumLabel(AdmissionCrmFinanceState, value);

export const getActivationStatusLabel = (value?: AdmissionCrmActivationStatus | null) =>
  enumLabel(AdmissionCrmActivationStatus, value);

export const getHandoffStatusLabel = (value?: AdmissionCrmServiceHandoffStatus | null) =>
  enumLabel(AdmissionCrmServiceHandoffStatus, value);

export const enrollmentDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export const enrollmentDateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatEnrollmentDate = (value?: string | Date | null, includeTime = false) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return (includeTime ? enrollmentDateTimeFormatter : enrollmentDateFormatter).format(date);
};
