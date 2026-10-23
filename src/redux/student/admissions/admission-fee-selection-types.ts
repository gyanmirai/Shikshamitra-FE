export type AdmissionFeeHead = {
  feeHeadId: string;
  feeHeadName: string;
  configuredAmount: number | null;
  isVariable?: boolean;
  isOptional: boolean;
  isOneTime: boolean;
  paymentTermId: string | null;
  paymentTermVersionId: string | null;
};

export type AdmissionFeeStructureCandidate = {
  structureId: string;
  structureName: string;
  revisionNumber: number;
  academicYearId: string;
  standardId: string;
  heads: AdmissionFeeHead[];
};

export type AdmissionSavedFeeSelection = AdmissionFeeStructureCandidate & {
  currency: string | null;
  savedAt: string;
  savedBy: string;
  onboardingConfirmedAt: string | null;
};

export type AdmissionFeeSelection = {
  applicationId: string;
  concurrencyStamp: string;
  ownerStageId: string | null;
  ownerStageName: string | null;
  ownerStageType: number | null;
  currentStageId: string | null;
  currency: string | null;
  available: boolean;
  isRequired: boolean;
  isLocked: boolean;
  hasRecordedFeePayment?: boolean;
  paymentCompletion?: {
    paymentRule: 'partial' | 'full';
    allowCollectionLater: boolean;
    canComplete: boolean;
    canDeferCollection: boolean;
    status: string;
    blocker: string | null;
  } | null;
  feeCollectionDeferral?: AdmissionFeeCollectionDeferral | null;
  canEdit: boolean;
  canConfirmOnboarding: boolean;
  onboardingConfirmed: boolean;
  automaticallyConfirmedFromAdmissions?: boolean;
  onboardingBlocker: string | null;
  selection: AdmissionSavedFeeSelection | null;
};

export type AdmissionFeeCollectionDeferral = {
  stageId: string;
  reason: string;
  deferredAt: string;
  deferredBy: string | null;
};

export type AdmissionFeeSelectionCommand = {
  applicationId: string;
  concurrencyStamp: string;
};

export const admissionFeeSelectionUrl = (applicationId: string) =>
  `/student/enrollment/admissions/fee-selections/applications/${applicationId}`;

export function unwrapAdmissionFeeSelection<T>(response: T | { data: T }): T {
  return response && typeof response === 'object' && 'data' in response
    ? response.data
    : (response as T);
}
