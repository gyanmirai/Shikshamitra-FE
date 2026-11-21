import { librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';

import type { LibraryPage } from './policy-types';
import type {
  LibraryCalendarClosure,
  LibraryCalendarSettings,
  LibraryCalendarCalculation,
  LibraryCalendarClosureRequest,
  LibraryCalendarCalculateRequest,
} from './calendar-types';

type Year = { academicYearId: string };
const calendarTags = [{ type: librarySettingsType.librarySettings, id: 'CALENDAR' }];

export const libraryCalendarApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryCalendarSettings: builder.query<LibraryCalendarSettings, Year>({
      query: (params) => ({ url: '/library/calendar/settings', params }),
      providesTags: calendarTags,
    }),
    updateLibraryCalendarSettings: builder.mutation<
      LibraryCalendarSettings,
      { timeZoneId: string }
    >({
      query: (body) => ({ url: '/library/calendar/settings', method: 'PUT', body }),
      invalidatesTags: calendarTags,
    }),
    getLibraryCalendarClosures: builder.query<
      LibraryPage<LibraryCalendarClosure>,
      Year & { page: number; pageSize: number }
    >({
      query: (params) => ({ url: '/library/calendar/closures', params }),
      providesTags: calendarTags,
    }),
    createLibraryCalendarClosure: builder.mutation<
      LibraryCalendarClosure,
      Year & { body: LibraryCalendarClosureRequest }
    >({
      query: ({ academicYearId, body }) => ({
        url: '/library/calendar/closures',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: calendarTags,
    }),
    updateLibraryCalendarClosure: builder.mutation<
      LibraryCalendarClosure,
      { closureId: string; body: LibraryCalendarClosureRequest }
    >({
      query: ({ closureId, body }) => ({
        url: `/library/calendar/closures/${closureId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: calendarTags,
    }),
    deleteLibraryCalendarClosure: builder.mutation<void, string>({
      query: (closureId) => ({ url: `/library/calendar/closures/${closureId}`, method: 'DELETE' }),
      invalidatesTags: calendarTags,
    }),
    calculateLibraryDate: builder.mutation<
      LibraryCalendarCalculation,
      LibraryCalendarCalculateRequest
    >({
      query: (body) => ({ url: '/library/calendar/calculate', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLibraryCalendarSettingsQuery,
  useUpdateLibraryCalendarSettingsMutation,
  useGetLibraryCalendarClosuresQuery,
  useCreateLibraryCalendarClosureMutation,
  useUpdateLibraryCalendarClosureMutation,
  useDeleteLibraryCalendarClosureMutation,
  useCalculateLibraryDateMutation,
} = libraryCalendarApi;
