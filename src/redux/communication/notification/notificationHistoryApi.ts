import { communicationType } from 'src/redux/tagTypes';

import { communicationApi } from '../communicationApi';
import { mapDeliveryAttemptToHistoryRow } from '../communicationMappers';

import type { PagedResultDto, DeliveryAttemptDto } from '../communicationTypes';

export const notificationHistoryApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationHistory: builder.query({
      query: (params) => ({
        url: '/communication/delivery-attempts',
        method: 'GET',
        params,
      }),
      transformResponse: (response: PagedResultDto<DeliveryAttemptDto>) =>
        response?.items?.map(mapDeliveryAttemptToHistoryRow) || [],
      providesTags: [
        communicationType.notificationHistory,
        communicationType.communicationDeliveryAttempts,
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetNotificationHistoryQuery } = notificationHistoryApi;
