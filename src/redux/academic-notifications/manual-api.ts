import { deliveryTag, academicNotificationDeliveryApi } from './delivery-api';
import { academicNotificationsRoot, academicNotificationCacheOwner } from './request-context';

import type { AcademicNotificationCacheIdentity } from './types';
import type { AcademicNotificationOperation } from './delivery-types';
import type { AcademicNotificationReview, PreviewAcademicNotification, AcademicNotificationRecipient, Student360NotificationAudience } from './manual-types';

const root = `${academicNotificationsRoot}/manual`;

export const academicNotificationManualApi = academicNotificationDeliveryApi.injectEndpoints({
  endpoints: (builder) => ({
    diaryFollowUpRecipients: builder.query<
      AcademicNotificationRecipient[], AcademicNotificationCacheIdentity & { diaryId: string }
    >({
      query: ({ diaryId, ...identity }) => ({
        url: `${root}/diary-follow-up-recipients/${encodeURIComponent(diaryId)}`, method: 'GET',
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
    }),
    student360NotificationAudience: builder.query<
      Student360NotificationAudience, AcademicNotificationCacheIdentity & { eventKey: string; studentId: string }
    >({
      query: ({ studentId, eventKey, ...identity }) => ({
        url: `${root}/student-360-audience/${encodeURIComponent(studentId)}`, method: 'GET', params: { eventKey },
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
    }),
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

export const {
  useDiaryFollowUpRecipientsQuery, usePreviewAcademicNotificationMutation,
  useSendAcademicNotificationMutation, useStudent360NotificationAudienceQuery,
} = academicNotificationManualApi;
