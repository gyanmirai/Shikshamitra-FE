import type { AdmissionDocumentPolicy } from './admission-document-policy';

export type DocumentStageKey = { applicationId: string; stageInstanceId: string };
export type DocumentStatus =
  'notRequired' | 'missing' | 'pendingReview' | 'accepted' | 'rejected' | 'waived';
export type AdmissionDocumentReview = {
  id: string;
  decision: 'accepted' | 'rejected';
  reason?: string | null;
  reviewedBy: string;
  reviewedAt: string;
};
export type AdmissionDocumentEvidence = {
  id: string;
  versionNumber: number;
  kind: 'upload' | 'original' | 'waiver';
  fileName?: string | null;
  contentType?: string | null;
  size?: number | null;
  sha256Hash?: string | null;
  originalSeen: boolean;
  originalSeenBy?: string | null;
  originalSeenAt?: string | null;
  submittedBy: string;
  submittedAt: string;
  notes?: string | null;
  status: 'pendingReview' | 'accepted' | 'rejected' | 'waived';
  canDownload: boolean;
  reviews: AdmissionDocumentReview[];
};
export type AdmissionDocumentRequirement = {
  code: string;
  name: string;
  description?: string | null;
  requirement: 'required' | 'optional' | 'conditional';
  collectionMode: 'upload' | 'original' | 'either' | 'both';
  isRequired: boolean;
  conditionStatus: 'notConditional' | 'matched' | 'notMatched' | 'undetermined';
  status: DocumentStatus;
  allowedExtensions?: string[];
  maxFileSizeMb?: number;
  blockers: string[];
  canUpload: boolean;
  canRecordOriginal: boolean;
  canReview: boolean;
  canAccept?: boolean;
  canWaive: boolean;
  evidence: AdmissionDocumentEvidence[];
};
export type ApplicationDocumentVerification = DocumentStageKey & {
  documentVerificationEnabled: boolean;
  policy: AdmissionDocumentPolicy | null;
  isActive: boolean;
  canComplete: boolean;
  blockers: string[];
  concurrencyStamp: string;
  requirements: AdmissionDocumentRequirement[];
};
export type DocumentRequirementAction = DocumentStageKey & {
  code: string;
  concurrencyStamp: string;
};
export const DOCUMENT_VERIFICATION_URL = '/student/enrollment/admissions/document-verification';
export const documentStageUrl = ({ applicationId, stageInstanceId }: DocumentStageKey) =>
  `${DOCUMENT_VERIFICATION_URL}/applications/${applicationId}/stages/${stageInstanceId}`;
export function unwrapDocuments<T>(response: T | { data: T }): T {
  return typeof response === 'object' && response !== null && 'data' in response
    ? response.data
    : response;
}
