import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { AdmissionCrmMessageDeliveryLogDto } from './communication-exams-events-contracts';

import {
  AdmissionCrmFormFieldType,
  AdmissionCrmLeadDto,
  AdmissionCrmListParams,
  AdmissionInquiryStage,
  CreateAdmissionCrmLeadDto,
} from './core-leads-contracts';

import { AdmissionCrmPlaybookApplicabilityDto } from './setup-playbooks-contracts';

export enum AdmissionCrmEventRegistrationStatus {
  Reserved = 0,
  CheckedIn = 1,
  Cancelled = 2,
  NoShow = 3,
}

export enum AdmissionCrmRegistrationTemplateStatus {
  Draft = 0,
  Published = 1,
  Retired = 2,
}

export enum AdmissionCrmRegistrationStatus {
  Issued = 0,
  Opened = 1,
  Started = 2,
  PartiallyCompleted = 3,
  Submitted = 4,
  ReturnedForCorrection = 5,
  Resubmitted = 6,
  Verified = 7,
  Expired = 8,
  Revoked = 9,
  Withdrawn = 10,
  AdmissionReady = 11,
}

export enum AdmissionCrmRegistrationFeeStatus {
  NotRequired = 0,
  Pending = 1,
  ReferenceRecorded = 2,
  Waived = 3,
  ConfirmedExternally = 4,
}

export enum AdmissionCrmRegistrationProvenance {
  OnlineParent = 0,
  StaffEnteredFromPaper = 1,
  StaffAssistedCounter = 2,
  Imported = 3,
}

export enum AdmissionCrmRegistrationDataEntryState {
  NotStarted = 0,
  InProgress = 1,
  Submitted = 2,
  Verified = 3,
}

export enum AdmissionCrmRegistrationAccessMode {
  Online = 0,
  StaffAssisted = 1,
  Both = 2,
}

export enum AdmissionCrmDocumentChecklistTemplateStatus {
  Draft = 0,
  Published = 1,
  Retired = 2,
}

export enum AdmissionCrmDocumentRequirementLevel {
  Required = 0,
  Optional = 1,
  Conditional = 2,
  RequiredLater = 3,
}

export enum AdmissionCrmApplicantDocumentStatus {
  Uploaded = 0,
  UnderReview = 1,
  Verified = 2,
  Rejected = 3,
  Expired = 4,
  Waived = 5,
  OriginalSeen = 6,
}

export enum AdmissionCrmRegistrationPath {
  RegistrationAfterExam = 0,
  RegistrationBeforeExam = 1,
  ExamWaived = 2,
  DirectRegistration = 3,
}

export type IssueAdmissionCrmRegistrationFormDto = {
  formNumber: string;
  amount: number;
};

export type AdmissionCrmRegistrationFieldDto = {
  key: string;
  label: string;
  fieldType: AdmissionCrmFormFieldType;
  systemField?: string | null;
  helpText?: string | null;
  required: boolean;
  parentEditable: boolean;
  displayOrder: number;
  visibleWhenFieldKey?: string | null;
  visibleWhenValue?: string | null;
  requiredWhenFieldKey?: string | null;
  requiredWhenValue?: string | null;
  validationPattern?: string | null;
  minimumLength?: number | null;
  maximumLength?: number | null;
  minimumValue?: number | null;
  maximumValue?: number | null;
  options: string[];
  localizedLabels?: Record<string, string>;
  localizedHelpTexts?: Record<string, string>;
  localizedOptions?: Record<string, string[]>;
};

export type AdmissionCrmRegistrationSectionDto = {
  key: string;
  title: string;
  description?: string | null;
  displayOrder: number;
  parentVisible: boolean;
  fields: AdmissionCrmRegistrationFieldDto[];
  localizedTitles?: Record<string, string>;
  localizedDescriptions?: Record<string, string>;
};

export type AdmissionCrmRegistrationTemplateUpsertDto = {
  name: string;
  isFallback: boolean;
  applicability: AdmissionCrmPlaybookApplicabilityDto;
  sections: AdmissionCrmRegistrationSectionDto[];
  linkExpiryDays: number;
  allowPartialSave: boolean;
  feeRequired: boolean;
  feeAmount: number;
  autoIssueAtStage?: AdmissionInquiryStage | null;
  notes?: string | null;
};

export type AdmissionCrmRegistrationTemplateDto = AdmissionCrmRegistrationTemplateUpsertDto & {
  id: string;
  academicYearId: string;
  version: number;
  status: AdmissionCrmRegistrationTemplateStatus;
  publishedAt?: string | null;
  retiredAt?: string | null;
};

export type AdmissionCrmRegistrationTemplateListParams = AdmissionCrmListParams & {
  filter?: string;
  status?: AdmissionCrmRegistrationTemplateStatus;
};

export type AdmissionCrmFormNumberSeriesUpsertDto = {
  name: string;
  prefix: string;
  suffix: string;
  padding: number;
  nextNumber: number;
  applicability: AdmissionCrmPlaybookApplicabilityDto;
  isActive: boolean;
};

export type AdmissionCrmFormNumberSeriesDto = AdmissionCrmFormNumberSeriesUpsertDto & {
  id: string;
  academicYearId: string;
  nextPreview: string;
};

export type IssueAdmissionCrmRegistrationApplicationDto = {
  registrationTemplateId: string;
  accessMode: AdmissionCrmRegistrationAccessMode;
  formNumberSeriesId?: string | null;
  manualFormNumber?: string | null;
  playbookId?: string | null;
  linkExpiryDays?: number | null;
  waiveFee: boolean;
  waiverReason?: string | null;
};

export type AdmissionCrmRegistrationReadinessBlockerDto = {
  code: string;
  message: string;
  actionCode?: string | null;
};

export type AdmissionCrmRegistrationReadinessDto = {
  canIssue: boolean;
  registrationPath: AdmissionCrmRegistrationPath;
  blockers: AdmissionCrmRegistrationReadinessBlockerDto[];
};

export type AdmissionCrmRegistrationIssuanceResultDto = {
  registration: AdmissionCrmRegistrationApplicationDto;
  delivery?: AdmissionCrmMessageDeliveryLogDto | null;
  deliveryError?: string | null;
};

export type CreateDirectAdmissionCrmRegistrationDto = {
  applicant: CreateAdmissionCrmLeadDto;
  registration: IssueAdmissionCrmRegistrationApplicationDto;
};

export type CreatePaperAdmissionCrmRegistrationDto = {
  applicant: CreateAdmissionCrmLeadDto;
  registration: IssueAdmissionCrmRegistrationApplicationDto;
  physicalFormNumber: string;
  physicalFormReceivedDate: string;
  physicalFormReceivedByUserId?: string | null;
  scannedFormAttachmentReference?: string | null;
};

export type AdmissionCrmDirectRegistrationResultDto = {
  applicant: AdmissionCrmLeadDto;
  registration: AdmissionCrmRegistrationApplicationDto;
};

export type SaveAdmissionCrmRegistrationResponsesDto = {
  concurrencyStamp: string;
  responses: Record<string, unknown>;
};

export type AdmissionCrmRegistrationApplicationDto = {
  id: string;
  concurrencyStamp: string;
  academicYearId: string;
  leadId: string;
  registrationTemplateId: string;
  registrationTemplateVersion: number;
  playbookId?: string | null;
  formNumber: string;
  provenance: AdmissionCrmRegistrationProvenance;
  accessMode: AdmissionCrmRegistrationAccessMode;
  dataEntryState: AdmissionCrmRegistrationDataEntryState;
  physicalFormNumber?: string | null;
  physicalFormReceivedDate?: string | null;
  physicalFormReceivedByUserId?: string | null;
  scannedFormAttachmentReference?: string | null;
  status: AdmissionCrmRegistrationStatus;
  sections: AdmissionCrmRegistrationSectionDto[];
  prefill: Record<string, unknown>;
  responses: Record<string, unknown>;
  correctionFieldKeys: string[];
  completionPercentage: number;
  issuedAt: string;
  linkExpiresAt: string;
  openedAt?: string | null;
  lastSavedAt?: string | null;
  submittedAt?: string | null;
  verifiedAt?: string | null;
  feeAmount: number;
  feeStatus: AdmissionCrmRegistrationFeeStatus;
  paymentReference?: string | null;
  lifecycleReason?: string | null;
  applicantStatusPath?: string | null;
};

export type AdmissionCrmDocumentRequirementDto = {
  key: string;
  documentTypeId?: string | null;
  name: string;
  requirementLevel: AdmissionCrmDocumentRequirementLevel;
  conditionalFieldKey?: string | null;
  conditionalFieldValue?: string | null;
  blocksAdmissionReadiness: boolean;
  requiresOriginal: boolean;
  validityDateRequired: boolean;
  expiryReminderDaysBefore?: number | null;
  maximumSizeMb: number;
  acceptedExtensions: string[];
  uploadInstructions?: string | null;
  rejectionReasons: string[];
  displayOrder: number;
};

export type AdmissionCrmDocumentChecklistTemplateUpsertDto = {
  name: string;
  isFallback: boolean;
  applicability: AdmissionCrmPlaybookApplicabilityDto;
  requirements: AdmissionCrmDocumentRequirementDto[];
  readinessApprovalCount: number;
  notes?: string | null;
};

export type AdmissionCrmDocumentChecklistTemplateDto =
  AdmissionCrmDocumentChecklistTemplateUpsertDto & {
    id: string;
    academicYearId: string;
    version: number;
    status: AdmissionCrmDocumentChecklistTemplateStatus;
    publishedAt?: string | null;
    retiredAt?: string | null;
  };

export type AdmissionCrmApplicantDocumentDto = {
  id?: string | null;
  requirementKey: string;
  requirementName: string;
  requirementLevel: AdmissionCrmDocumentRequirementLevel;
  isCurrentlyRequired: boolean;
  blocksAdmissionReadiness: boolean;
  requiresOriginal: boolean;
  validityDateRequired: boolean;
  expiryReminderDaysBefore?: number | null;
  originalSeen: boolean;
  status?: AdmissionCrmApplicantDocumentStatus | null;
  version: number;
  fileName?: string | null;
  contentType?: string | null;
  fileSize?: number | null;
  validUntil?: string | null;
  uploadedAt?: string | null;
  decisionReason?: string | null;
  decisionAt?: string | null;
  acceptedExtensions: string[];
  maximumSizeMb: number;
  uploadInstructions?: string | null;
  rejectionReasons: string[];
};

export type AdmissionCrmApplicantDocumentChecklistDto = {
  assignmentId: string;
  registrationApplicationId: string;
  checklistTemplateId: string;
  checklistTemplateVersion: number;
  checklistName: string;
  completionPercentage: number;
  admissionReady: boolean;
  readinessConfirmed: boolean;
  readinessOverridden: boolean;
  requiredReadinessApprovalCount: number;
  receivedReadinessApprovalCount: number;
  awaitingSecondReadinessApproval: boolean;
  blockingReasons: string[];
  documents: AdmissionCrmApplicantDocumentDto[];
};

export type AdmissionCrmEventRegistrationDto = {
  id: string;
  leadId: string;
  applicantName: string;
  parentGuardianName?: string | null;
  primaryContactNo?: string | null;
  status: AdmissionCrmEventRegistrationStatus;
  reservedAt: string;
  checkedInAt?: string | null;
  cancelledAt?: string | null;
  noShowRecordedAt?: string | null;
  notes?: string | null;
  cancellationReason?: string | null;
};

export type AdmissionCrmRegistrationAnalyticsDto = {
  issuedCount: number;
  openedCount: number;
  startedCount: number;
  submittedCount: number;
  verifiedCount: number;
  admissionReadyCount: number;
  expiredCount: number;
  correctionPendingCount: number;
  abandonedCount: number;
  openRate: number;
  completionRate: number;
  verificationRate: number;
  admissionYieldRate: number;
  averageCompletionPercentage: number;
};

export type AdmissionCrmRegistrationQueueContextDto = {
  registrationApplicationId?: string | null;
  status?: AdmissionCrmRegistrationStatus | null;
  formNumber?: string | null;
  provenance?: AdmissionCrmRegistrationProvenance | null;
  dataEntryState?: AdmissionCrmRegistrationDataEntryState | null;
  physicalFormNumber?: string | null;
  physicalFormReceivedDate?: string | null;
  completionPercentage: number;
  linkExpiresAt?: string | null;
  feeStatus?: AdmissionCrmRegistrationFeeStatus | null;
  documentTotalCount: number;
  documentResolvedCount: number;
  documentPendingCount: number;
  currentDocumentStatus?: AdmissionCrmApplicantDocumentStatus | null;
  readinessConfirmed: boolean;
};

export const buildIssueAdmissionCrmRegistrationFormRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: IssueAdmissionCrmRegistrationFormDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/registration-form`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmRegistrationTemplateListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmRegistrationTemplateListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/registration-templates`,
  method: 'GET',
  params,
});

export const buildCreateAdmissionCrmRegistrationTemplateRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: AdmissionCrmRegistrationTemplateUpsertDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/registration-templates`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmFormNumberSeriesListRequest = ({
  academicYearId,
}: {
  academicYearId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/form-number-series`,
  method: 'GET',
});

export const buildIssueAdmissionCrmRegistrationApplicationRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: IssueAdmissionCrmRegistrationApplicationDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/registrations/issue`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmDocumentChecklistTemplateListRequest = ({
  academicYearId,
  ...params
}: {
  academicYearId: string;
  filter?: string;
  status?: AdmissionCrmDocumentChecklistTemplateStatus;
  skipCount?: number;
  maxResultCount?: number;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/document-checklists`,
  method: 'GET',
  params,
});

export const buildAssignAdmissionCrmDocumentChecklistRequest = ({
  registrationApplicationId,
  checklistTemplateId,
}: {
  registrationApplicationId: string;
  checklistTemplateId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/registrations/${registrationApplicationId}/document-checklist`,
  method: 'POST',
  body: { checklistTemplateId },
});
