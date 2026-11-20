import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';

import type {
  ReservationReviewPreview,
  ReservationReviewPreviewRequest,
} from './reservation-types';

export const libraryReservationReviewApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    previewLibraryReservationReview: builder.query<
      ReservationReviewPreview,
      { reservationId: string; body: ReservationReviewPreviewRequest }
    >({
      query: ({ reservationId, body }) => ({
        url: `/library/reservations/${reservationId}/review-preview`,
        method: 'POST',
        body,
      }),
      providesTags: [libraryModuleType.librarySettings, libraryModuleType.bookReservation],
    }),
  }),
  overrideExisting: false,
});
export const { usePreviewLibraryReservationReviewQuery } = libraryReservationReviewApi;
