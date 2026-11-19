import { deliveryTag, academicNotificationDeliveryApi } from './delivery-api';
import { academicNotificationsRoot, academicNotificationCacheOwner } from './request-context';

import type { AcademicNotificationCacheIdentity } from './types';
import type { AcademicNotificationOperation } from './delivery-types';
import type { AcademicNotificationReview, PreviewAcademicNotification } from './manual-types';

const root = `${academicNotificationsRoot}/manual`;

export const academicNotificationManualApi = academicNotificationDeliveryApi.injectEndpoints({
  endpoints: (builder) => ({
    previewAcademicNotification: builder.mutation<
      AcademicNotificationReview, AcademicNotificationCacheIdentity & { input: PreviewAcademicNotification }
    >({
      query: ({ input, ...identity }) => ({
        url: `${root}/preview`, method: 'POST', body: input,
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
    }),
    sendAcademicNotification: builder.mutation<
      AcademicNotificationOperation,
      AcademicNotificationCacheIdentity & { input: { reviewToken: string; idempotencyKey: string } }
    >({
      query: ({ input, ...identity }) => ({
        url: `${root}/send`, method: 'POST', body: input,
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      invalidatesTags: (_, error, identity) => !error ? [deliveryTag(identity)] : [],
    }),
  }),
});

export const { usePreviewAcademicNotificationMutation, useSendAcademicNotificationMutation } = academicNotificationManualApi;
