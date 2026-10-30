import { academicType, instituteSetupType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';
import { reservationPageUrl } from './roomReadContracts';

import type { WeeklyRoomRow, WeeklyRoomInput } from './weeklyRoomReadContracts';
import type { ReservationPage, RoomAuditReadRow, RoomAuditPageInput, ReservationPageInput } from './roomReadContracts';

export const roomAvailabilityApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeeklyTimetableRooms: builder.query<WeeklyRoomRow[], WeeklyRoomInput>({
      query: (params) => ({
        url: 'academics/timetable/room-availability',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.timetableManagement, instituteSetupType.rooms],
    }),
    getReservationPage: builder.query<ReservationPage, ReservationPageInput>({
      query: reservationPageUrl,
      providesTags: [academicType.timetableManagement],
    }),
    getReservationSummary: builder.query<{ statusCounts: Record<string, number> }, { createdDate?: string; isApprovalView?: boolean }>({
      query: params => ({ url: 'academics/timetable/room-reservations/summary', params }),
      providesTags: [academicType.timetableManagement],
    }),
    getRoomAuditPage: builder.query<{ totalCount: number; items: RoomAuditReadRow[] }, RoomAuditPageInput>({
      query: params => ({ url: 'academics/timetable/room-availability/audit-logs/page', params }),
      providesTags: [academicType.timetableManagement],
    }),
    getRoomAvailability: builder.query({
      query: (filters) => ({
        url: 'academics/timetable/room-availability',
        method: 'GET',
        params: filters,
      }),
      providesTags: [academicType.timetableManagement],
    }),

    getReservations: builder.query({
      query: (params) => ({
        url: 'academics/timetable/room-reservations',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.timetableManagement],
    }),
    checkRoomConflicts: builder.mutation({
      query: (body) => ({
        url: 'academics/timetable/room-reservations/check-conflicts',
        method: 'POST',
        body,
      }),
    }),
    suggestAlternativeRooms: builder.mutation({
      query: (body) => ({
        url: 'academics/timetable/room-reservations/suggest-rooms',
        method: 'POST',
        body,
      }),
    }),
    createRoomReservation: builder.mutation({
      query: (body) => ({
        url: 'academics/timetable/room-reservations',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.timetableManagement],
    }),
    updateRoomReservation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `academics/timetable/room-reservations/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.timetableManagement],
    }),
    cancelRoomReservation: builder.mutation({
      query: ({ id, reason }) => ({
        url: `academics/timetable/room-reservations/${id}/cancel`,
        method: 'POST',
        body: JSON.stringify(reason),
      }),
      invalidatesTags: [academicType.timetableManagement],
    }),
    approveRoomReservation: builder.mutation({
      query: (id) => ({
        url: `academics/timetable/room-reservations/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.timetableManagement],
    }),
    rejectRoomReservation: builder.mutation({
      query: ({ id, reason }) => ({
        url: `academics/timetable/room-reservations/${id}/reject`,
        method: 'POST',
        body: JSON.stringify(reason),
      }),
      invalidatesTags: [academicType.timetableManagement],
    }),
    createMaintenanceBlock: builder.mutation({
      query: (body) => ({
        url: 'academics/timetable/room-maintenance-blocks',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.timetableManagement],
    }),
    getRoomAuditLogs: builder.query({
      query: (roomId) => ({
        url: 'academics/timetable/room-availability/audit-logs',
        method: 'GET',
        params: roomId ? { roomId } : undefined,
      }),
      providesTags: [academicType.timetableManagement],
    }),
    getRoomUsageReport: builder.query({
      query: () => ({
        url: 'academics/timetable/room-availability/usage-report',
        method: 'GET',
      }),
    }),
    getRoomSchedule: builder.query({
      query: ({ roomId, date }) => ({
        url: 'academics/timetable/room-availability/schedule',
        method: 'GET',
        params: { roomId, date },
      }),
      providesTags: [academicType.timetableManagement],
    }),
  }),
});

export const {
  useGetWeeklyTimetableRoomsQuery,
  useGetReservationPageQuery,
  useLazyGetReservationPageQuery,
  useGetReservationSummaryQuery,
  useGetRoomAuditPageQuery,
  useGetRoomAvailabilityQuery,
  useGetReservationsQuery,
  useCheckRoomConflictsMutation,
  useSuggestAlternativeRoomsMutation,
  useCreateRoomReservationMutation,
  useUpdateRoomReservationMutation,
  useCancelRoomReservationMutation,
  useApproveRoomReservationMutation,
  useRejectRoomReservationMutation,
  useCreateMaintenanceBlockMutation,
  useGetRoomAuditLogsQuery,
  useGetRoomUsageReportQuery,
  useGetRoomScheduleQuery,
} = roomAvailabilityApi;
