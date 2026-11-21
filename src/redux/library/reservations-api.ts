import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { toLibraryPaginatedList } from './library-adapters';
import { libraryReservationMutationTags } from './library-cache-tags';

import type { LibraryPaginatedList } from './library-adapters';
import type {
  ReservationEvent,
  ReservationAction,
  ReservationReview,
  ReservationCreate,
  ReservationMember,
  ReservationPickup,
  ReservationContext,
  LibraryReservation,
  ReservationPreview,
  ReservationIdentity,
} from './reservation-types';

const listTags = [libraryModuleType.bookReservation];
const mutationTags = [
  ...libraryReservationMutationTags,
  libraryModuleType.libraryNotificationHistory,
];
export const libraryReservationsApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getReservationPickupLocations: builder.query<ReservationPickup[], ReservationContext>({
      query: (params) => ({ url: '/library/reservations/pickup-locations', params }),
      providesTags: [libraryModuleType.librarySettings],
    }),
    previewLibraryReservation: builder.query<ReservationPreview, ReservationCreate>({
      query: (body) => ({ url: '/library/reservations/preview', method: 'POST', body }),
      providesTags: [libraryModuleType.librarySettings, libraryModuleType.bookReservation],
    }),
    searchReservationMembers: builder.query<
      LibraryPaginatedList<ReservationMember>,
      ReservationContext & { search: string; page: number; pageSize: number }
    >({
      query: (params) => ({ url: '/library/reservations/members', params }),
      transformResponse: (response: unknown) => toLibraryPaginatedList<ReservationMember>(response),
      providesTags: [libraryModuleType.members],
    }),
    resolveReservationMember: builder.query<
      ReservationMember,
      ReservationContext & { identifier: string }
    >({
      query: (params) => ({ url: '/library/reservations/members/resolve', params }),
      providesTags: [libraryModuleType.members],
    }),
    listLibraryReservations: builder.query<
      LibraryPaginatedList<LibraryReservation>,
      ReservationContext & {
        bookId: string;
        page: number;
        pageSize: number;
        includeHistory: boolean;
      }
    >({
      query: (params) => ({ url: '/library/reservations', params }),
      transformResponse: (response: unknown) =>
        toLibraryPaginatedList<LibraryReservation>(response),
      providesTags: listTags,
    }),
    getLibraryReservation: builder.query<LibraryReservation, ReservationIdentity>({
      query: ({ reservationId, ...params }) => ({
        url: `/library/reservations/${reservationId}`,
        params,
      }),
      providesTags: listTags,
    }),
    getLibraryReservationEvents: builder.query<
      LibraryPaginatedList<ReservationEvent>,
      ReservationIdentity & { page: number; pageSize: number }
    >({
      query: ({ reservationId, ...params }) => ({
        url: `/library/reservations/${reservationId}/events`,
        params,
      }),
      transformResponse: (response: unknown) => toLibraryPaginatedList<ReservationEvent>(response),
      providesTags: listTags,
    }),
    createLibraryReservation: builder.mutation<LibraryReservation, ReservationCreate>({
      query: (body) => ({ url: '/library/reservations', method: 'POST', body }),
      invalidatesTags: mutationTags,
    }),
    cancelLibraryReservation: builder.mutation<
      LibraryReservation,
      { reservationId: string; body: ReservationAction }
    >({
      query: ({ reservationId, body }) => ({
        url: `/library/reservations/${reservationId}/cancel`,
        method: 'POST',
        body,
      }),
      invalidatesTags: mutationTags,
    }),
    reviewLibraryReservation: builder.mutation<
      LibraryReservation,
      { reservationId: string; body: ReservationReview }
    >({
      query: ({ reservationId, body }) => ({
        url: `/library/reservations/${reservationId}/review`,
        method: 'POST',
        body,
      }),
      invalidatesTags: mutationTags,
    }),
  }),
  overrideExisting: false,
});
export const {
  useGetReservationPickupLocationsQuery,
  usePreviewLibraryReservationQuery,
  useLazySearchReservationMembersQuery,
  useLazyResolveReservationMemberQuery,
  useListLibraryReservationsQuery,
  useGetLibraryReservationQuery,
  useLazyGetLibraryReservationQuery,
  useGetLibraryReservationEventsQuery,
  useCreateLibraryReservationMutation,
  useCancelLibraryReservationMutation,
  useReviewLibraryReservationMutation,
} = libraryReservationsApi;
