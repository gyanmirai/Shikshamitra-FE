import type { AdmissionPaymentPolicy } from './admission-payment-policy';

export type AdmissionPaymentTransaction = {
  id: string; attemptNumber: number; amount: number; currency: string; method: string;
  collectionMode: string; status: string; externalReference?: string | null; provider?: string | null;
  receiptNumber?: string | null; notes?: string | null; decisionReason?: string | null;
  recordedBy?: string | null; recordedAt: string; verifiedBy?: string | null;
  verifiedAt?: string | null; concurrencyStamp: string;
};
export type AdmissionPaymentStage = {
  applicationId: string; stageId: string; paymentStageEnabled: boolean;
  policy?: AdmissionPaymentPolicy | null; isActive: boolean; dueAt?: string | null; isOverdue: boolean;
  requiredAmount: number; settledAmount: number; pendingAmount: number; outstandingAmount: number;
  currency: string; status: string; concurrencyStamp: string; transactions: AdmissionPaymentTransaction[];
  blockers: string[]; canRecord: boolean; canStartOnlinePayment: boolean; canVerify: boolean;
  canWaive: boolean; canReverse: boolean; canComplete: boolean;
};
export type AdmissionPaymentStageKey = { applicationId: string; stageId: string };
export type AdmissionPaymentCommand = AdmissionPaymentStageKey & { concurrencyStamp: string };

export const paymentStageUrl = ({ applicationId, stageId }: AdmissionPaymentStageKey) =>
  `/student/enrollment/admissions/payments/applications/${applicationId}/stages/${stageId}`;
export const unwrapPayment = <T>(response: { data?: T } | T): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data : (response as T);
