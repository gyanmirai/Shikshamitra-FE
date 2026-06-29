import { academicCalendarType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

export const academicCalendarApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Calendar Setup ─────────────────────────────────────────────────────

    getCalendars: builder.query({
      query: (params?: { academicYearId?: string; status?: number }) => ({
        url: '/academic/calendars',
        method: 'GET',
        params,
      }),
      providesTags: [academicCalendarType.calendar],
    }),

    getCalendarById: builder.query({
      query: (id: string) => ({
        url: `/academic/calendars/${id}`,
        method: 'GET',
      }),
      providesTags: [academicCalendarType.calendar],
    }),

    createCalendar: builder.mutation({
      query: (body) => ({
        url: '/academic/calendars',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicCalendarType.calendar],
    }),

    updateCalendar: builder.mutation({
      query: ({ id, body }: { id: string; body: any }) => ({
        url: `/academic/calendars/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicCalendarType.calendar],
    }),

    deleteCalendar: builder.mutation({
      query: (id: string) => ({
        url: `/academic/calendars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicCalendarType.calendar],
    }),

    publishCalendar: builder.mutation({
      query: (id: string) => ({
        url: `/academic/calendars/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [academicCalendarType.calendar],
    }),

    archiveCalendar: builder.mutation({
      query: (id: string) => ({
        url: `/academic/calendars/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: [academicCalendarType.calendar],
    }),

    // ─── Calendar Days ──────────────────────────────────────────────────────

    getCalendarDays: builder.query({
      query: ({
        calendarId,
        ...params
      }: {
        calendarId: string;
        dayType?: number;
        month?: number;
        year?: number;
      }) => ({
        url: `/academic/calendars/${calendarId}/days`,
        method: 'GET',
        params,
      }),
      providesTags: [academicCalendarType.calendarDay],
    }),

    createCalendarDay: builder.mutation({
      query: ({ calendarId, body }: { calendarId: string; body: any }) => ({
        url: `/academic/calendars/${calendarId}/days`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicCalendarType.calendarDay, academicCalendarType.calendar],
    }),

    createCalendarDaysBulk: builder.mutation({
      query: ({ calendarId, body }: { calendarId: string; body: any }) => ({
        url: `/academic/calendars/${calendarId}/days/bulk`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicCalendarType.calendarDay, academicCalendarType.calendar],
    }),

    updateCalendarDay: builder.mutation({
      query: ({ id, body }: { id: string; body: any }) => ({
        url: `/academic/calendar-days/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicCalendarType.calendarDay, academicCalendarType.calendar],
    }),

    deleteCalendarDay: builder.mutation({
      query: (id: string) => ({
        url: `/academic/calendar-days/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicCalendarType.calendarDay, academicCalendarType.calendar],
    }),

    // ─── Working Hours ──────────────────────────────────────────────────────

    getWorkingHours: builder.query({
      query: (calendarId: string) => ({
        url: `/academic/calendars/${calendarId}/working-hours`,
        method: 'GET',
      }),
      providesTags: [academicCalendarType.workingHour],
    }),

    createWorkingHour: builder.mutation({
      query: ({ calendarId, body }: { calendarId: string; body: any }) => ({
        url: `/academic/calendars/${calendarId}/working-hours`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicCalendarType.workingHour],
    }),

    updateWorkingHour: builder.mutation({
      query: ({ id, body }: { id: string; body: any }) => ({
        url: `/academic/calendar-working-hours/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicCalendarType.workingHour],
    }),

    deleteWorkingHour: builder.mutation({
      query: (id: string) => ({
        url: `/academic/calendar-working-hours/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicCalendarType.workingHour],
    }),

    // ─── Date Validation ────────────────────────────────────────────────────

    checkDate: builder.query({
      query: (params: {
        date: string;
        standardId?: string;
        divisionId?: string;
        validationType: string;
      }) => ({
        url: '/academic/calendar/check-date',
        method: 'GET',
        params,
      }),
      providesTags: [academicCalendarType.checkDate],
    }),

    // ─── Emergency Closure ──────────────────────────────────────────────────

    createEmergencyClosure: builder.mutation({
      query: (body) => ({
        url: '/academic/calendar-days/emergency-closure',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        academicCalendarType.calendarDay,
        academicCalendarType.calendar,
        academicCalendarType.impactLog,
        academicCalendarType.emergencyClosure,
      ],
    }),

    cancelEmergencyClosure: builder.mutation({
      query: (id: string) => ({
        url: `/academic/calendar-days/${id}/cancel-emergency-closure`,
        method: 'POST',
      }),
      invalidatesTags: [
        academicCalendarType.calendarDay,
        academicCalendarType.impactLog,
        academicCalendarType.emergencyClosure,
      ],
    }),

    // ─── Impact Logs ────────────────────────────────────────────────────────

    getImpactLogs: builder.query({
      query: (params?: {
        calendarDayId?: string;
        impactType?: number;
        status?: number;
        skipCount?: number;
        maxResultCount?: number;
      }) => ({
        url: '/academic/calendar-impact-logs',
        method: 'GET',
        params,
      }),
      providesTags: [academicCalendarType.impactLog],
    }),

    getImpactLogsByDay: builder.query({
      query: (calendarDayId: string) => ({
        url: `/academic/calendar-impact-logs/by-day/${calendarDayId}`,
        method: 'GET',
      }),
      providesTags: [academicCalendarType.impactLog],
    }),

    resolveImpactLog: builder.mutation({
      query: ({ id, body }: { id: string; body: { resolutionNote?: string } }) => ({
        url: `/academic/calendar-impact-logs/${id}/mark-resolved`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicCalendarType.impactLog],
    }),

    ignoreImpactLog: builder.mutation({
      query: ({ id, body }: { id: string; body: { reason: string } }) => ({
        url: `/academic/calendar-impact-logs/${id}/ignore`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicCalendarType.impactLog],
    }),

    rescheduleImpactLog: builder.mutation({
      query: ({ id, body }: { id: string; body: { newDate: string; note?: string } }) => ({
        url: `/academic/calendar-impact-logs/${id}/reschedule`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicCalendarType.impactLog],
    }),

    // ─── Audit Logs ─────────────────────────────────────────────────────────

    getAuditLogs: builder.query({
      query: (params?: {
        calendarId?: string;
        action?: number;
        skipCount?: number;
        maxResultCount?: number;
      }) => ({
        url: '/academic/calendar-audit-logs',
        method: 'GET',
        params,
      }),
      providesTags: [academicCalendarType.auditLog],
    }),

    getAuditLogsByCalendar: builder.query({
      query: (calendarId: string) => ({
        url: `/academic/calendar-audit-logs/by-calendar/${calendarId}`,
        method: 'GET',
      }),
      providesTags: [academicCalendarType.auditLog],
    }),

    getAuditLogsByDay: builder.query({
      query: (calendarDayId: string) => ({
        url: `/academic/calendar-audit-logs/by-day/${calendarDayId}`,
        method: 'GET',
      }),
      providesTags: [academicCalendarType.auditLog],
    }),

    // ─── Settings ───────────────────────────────────────────────────────────

    getCalendarSettings: builder.query({
      query: (params?: { academicYearId?: string }) => ({
        url: '/academic/calendar/settings',
        method: 'GET',
        params,
      }),
      providesTags: [academicCalendarType.settings],
    }),

    createCalendarSettings: builder.mutation({
      query: (body) => ({
        url: '/academic/calendar/settings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicCalendarType.settings],
    }),

    updateCalendarSettings: builder.mutation({
      query: ({ id, body }: { id: string; body: any }) => ({
        url: `/academic/calendar/settings/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicCalendarType.settings],
    }),

    // ─── Dashboard ──────────────────────────────────────────────────────────

    getCalendarDashboard: builder.query({
      query: (params?: { academicYearId?: string }) => ({
        url: '/academic/calendar/dashboard',
        method: 'GET',
        params,
      }),
      providesTags: [academicCalendarType.calendar],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCalendarsQuery,
  useGetCalendarByIdQuery,
  useCreateCalendarMutation,
  useUpdateCalendarMutation,
  useDeleteCalendarMutation,
  usePublishCalendarMutation,
  useArchiveCalendarMutation,

  useGetCalendarDaysQuery,
  useCreateCalendarDayMutation,
  useCreateCalendarDaysBulkMutation,
  useUpdateCalendarDayMutation,
  useDeleteCalendarDayMutation,

  useGetWorkingHoursQuery,
  useCreateWorkingHourMutation,
  useUpdateWorkingHourMutation,
  useDeleteWorkingHourMutation,

  useCheckDateQuery,

  useCreateEmergencyClosureMutation,
  useCancelEmergencyClosureMutation,

  useGetImpactLogsQuery,
  useGetImpactLogsByDayQuery,
  useResolveImpactLogMutation,
  useIgnoreImpactLogMutation,
  useRescheduleImpactLogMutation,

  useGetAuditLogsQuery,
  useGetAuditLogsByCalendarQuery,
  useGetAuditLogsByDayQuery,

  useGetCalendarSettingsQuery,
  useCreateCalendarSettingsMutation,
  useUpdateCalendarSettingsMutation,

  useGetCalendarDashboardQuery,
} = academicCalendarApi;
