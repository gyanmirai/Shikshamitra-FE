import type { AdmissionSeatPolicy } from './admission-seat-policy';

export type AdmissionSeatEvent = {
  id: string; action: string; reason?: string | null; actorId?: string | null;
  occurredAt: string; metadataJson?: string | null;
};
export type AdmissionSeatStage = {
  applicationId: string; admissionOfferingId: string; stageId: string; seatStageEnabled: boolean;
  policy?: AdmissionSeatPolicy | null; isActive: boolean; status: string; capacity: number;
  reservedCount: number; confirmedCount: number; remainingCapacity: number; isOverCapacity: boolean;
  reservationId?: string | null; reservedAt?: string | null; expiresAt?: string | null;
  confirmedAt?: string | null; renewalCount: number; waitlistPosition?: number | null;
  concurrencyStamp: string; poolConcurrencyStamp?: string | null; reservationConcurrencyStamp?: string | null;
  events: AdmissionSeatEvent[]; blockers: string[]; canReserve: boolean; canConfirm: boolean;
  canRenew: boolean; canRelease: boolean; canJoinWaitlist: boolean; canManageCapacity: boolean;
  canComplete: boolean;
};
export type AdmissionSeatStageKey = { applicationId: string; stageId: string };
export type AdmissionSeatCommand = AdmissionSeatStageKey & {
  concurrencyStamp: string; reservationConcurrencyStamp?: string;
};

export const seatStageUrl = ({ applicationId, stageId }: AdmissionSeatStageKey) =>
  `/student/enrollment/admissions/seats/applications/${applicationId}/stages/${stageId}`;
export const unwrapSeat = <T>(response: { data?: T } | T): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data : (response as T);
