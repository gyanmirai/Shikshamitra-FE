import { api } from '../service';
import { academicNotificationsRoot, academicNotificationCacheOwner } from './request-context';

import type { AcademicNotificationCacheIdentity } from './types';
import type { PagedResultDto } from '../communication/communicationTypes';
import type {
  AcademicDispatchStatus,
  AcademicNotificationRetry,
  AcademicNotificationSource,
  AcademicNotificationOperation,
  AcademicNotificationHistoryItem,
  AcademicNotificationCancellation,
  AcademicNotificationApprovalReview,
  AcademicNotificationOperationStatus,
  AcademicNotificationPendingApprovals,
} from './delivery-types';

type OperationRequest = AcademicNotificationCacheIdentity & { operationId: string };
type ApprovalDecision = OperationRequest & { decision: 'approve' | 'reject' };
type PendingApprovalsRequest = AcademicNotificationCacheIdentity & { afterId?: string };
type RetryRequest = AcademicNotificationCacheIdentity & { dispatchId: string; attemptId: string };
type HistoryRequest = AcademicNotificationCacheIdentity & AcademicNotificationSource & {
  operationId?: string;
  state?: AcademicDispatchStatus;
  skipCount: number;
  maxResultCount: number;
};

const tag = 'AcademicNotificationDelivery' as const;

export function deliveryTag(identity: AcademicNotificationCacheIdentity) {
  return { type: tag, id: academicNotificationCacheOwner(identity) };
}

function operationUrl(id: string) {
  return `${academicNotificationsRoot}/operations/${encodeURIComponent(id)}`;
}

export const academicNotificationDeliveryApi = api.enhanceEndpoints({ addTagTypes: [tag] }).injectEndpoints({
  endpoints: (builder) => ({
    academicNotificationOperation: builder.query<AcademicNotificationOperationStatus, OperationRequest>({
      query: ({ operationId, ...identity }) => ({
        url: operationUrl(operationId), cache: 'no-store', expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      providesTags: (_, __, identity) => [deliveryTag(identity)],
      keepUnusedDataFor: 0,
    }),
    academicNotificationPendingApprovals: builder.query<AcademicNotificationPendingApprovals, PendingApprovalsRequest>({
      query: ({ afterId, ...identity }) => ({
        url: `${academicNotificationsRoot}/operations/pending-approvals`, params: { afterId },
        cache: 'no-store', expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      providesTags: (_, __, identity) => [deliveryTag(identity)],
      keepUnusedDataFor: 0,
    }),
    academicNotificationApprovalReview: builder.query<AcademicNotificationApprovalReview, OperationRequest>({
      query: ({ operationId, ...identity }) => ({
        url: `${operationUrl(operationId)}/approval-review`, cache: 'no-store',
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      providesTags: (_, __, identity) => [deliveryTag(identity)],
      keepUnusedDataFor: 0,
    }),
    decideAcademicNotificationApproval: builder.mutation<AcademicNotificationOperation, ApprovalDecision>({
      query: ({ operationId, decision, ...identity }) => ({
        url: `${operationUrl(operationId)}/${decision}`, method: 'POST',
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      invalidatesTags: (_, __, identity) => [deliveryTag(identity)],
    }),
    academicNotificationHistory: builder.query<PagedResultDto<AcademicNotificationHistoryItem>, HistoryRequest>({
      query: ({ tenantCacheKey, userCacheKey, ...params }) => ({
        url: `${academicNotificationsRoot}/history`, params, cache: 'no-store',
        expectedSessionOwner: academicNotificationCacheOwner({ tenantCacheKey, userCacheKey }),
      }),
      providesTags: (_, __, identity) => [deliveryTag(identity)],
      keepUnusedDataFor: 0,
    }),
    cancelAcademicNotificationOperation: builder.mutation<AcademicNotificationCancellation, OperationRequest>({
      query: ({ operationId, ...identity }) => ({
        url: `${operationUrl(operationId)}/cancel`, method: 'POST', expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      invalidatesTags: (_, error, identity) => !error ? [deliveryTag(identity)] : [],
    }),
    retryAcademicNotificationDispatch: builder.mutation<AcademicNotificationRetry, RetryRequest>({
      query: ({ dispatchId, attemptId, ...identity }) => ({
        url: `${academicNotificationsRoot}/dispatches/${encodeURIComponent(dispatchId)}/retry`,
        method: 'POST', params: { expectedAttemptId: attemptId },
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      invalidatesTags: (_, __, identity) => [deliveryTag(identity)],
    }),
  }),
});

export const {
  useAcademicNotificationOperationQuery,
  useAcademicNotificationPendingApprovalsQuery,
  useAcademicNotificationApprovalReviewQuery,
  useDecideAcademicNotificationApprovalMutation,
  useAcademicNotificationHistoryQuery,
  useCancelAcademicNotificationOperationMutation,
  useRetryAcademicNotificationDispatchMutation,
} = academicNotificationDeliveryApi;
