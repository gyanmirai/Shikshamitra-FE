import { api } from '../service';
import { academicNotificationsRoot, academicNotificationCacheOwner } from './request-context';

import type { AcademicNotificationCacheIdentity } from './types';
import type { PagedResultDto } from '../communication/communicationTypes';
import type {
  AcademicDispatchStatus,
  AcademicNotificationSource,
  AcademicNotificationHistoryItem,
  AcademicNotificationCancellation,
  AcademicNotificationOperationStatus,
} from './delivery-types';

type OperationRequest = AcademicNotificationCacheIdentity & { operationId: string };
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
  }),
});

export const {
  useAcademicNotificationOperationQuery,
  useAcademicNotificationHistoryQuery,
  useCancelAcademicNotificationOperationMutation,
} = academicNotificationDeliveryApi;
