import type { AdmissionOfferPolicy } from './admission-offer-policy';
import type { AdmissionApplicationStatus } from './admission-applications-api';

export type AdmissionOfferEvent = {
  id: string; action: string; applicationStatus: AdmissionApplicationStatus; reason?: string | null;
  actorId?: string | null; occurredAt: string; metadataJson?: string | null;
};
export type AdmissionOfferStage = {
  applicationId: string; admissionOfferingId: string; stageId: string; offerStageEnabled: boolean;
  assignedCounsellorId?: string | null; assignedCounsellorName?: string | null;
  policy?: AdmissionOfferPolicy | null; isActive: boolean; status: string; versionNumber: number;
  extensionCount: number; reissueCount: number; issuedAt?: string | null; expiresAt?: string | null;
  respondedAt?: string | null; concurrencyStamp: string; events: AdmissionOfferEvent[];
  blockers: string[]; canIssue: boolean; canAccept: boolean; canDecline: boolean;
  canExtend: boolean; canWithdraw: boolean; canReissue: boolean; canComplete: boolean;
};
export type AdmissionOfferStageKey = { applicationId: string; stageId: string };
export type AdmissionOfferCommand = AdmissionOfferStageKey & { concurrencyStamp: string };

export const offerStageUrl = ({ applicationId, stageId }: AdmissionOfferStageKey) =>
  `/student/enrollment/admissions/offers/applications/${applicationId}/stages/${stageId}`;
export const unwrapOffer = <T>(response: { data?: T } | T): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data : (response as T);
