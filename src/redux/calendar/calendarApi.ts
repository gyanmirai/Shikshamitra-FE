import { api } from '../service';
import { calendarModuleType } from '../tagTypes';

const toCalendarViewSearchParams = (params: Record<string, any>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams;
};

export const calendarModuleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarView: builder.query({
      query: (params) => ({
        url: '/calendar/view',
        method: 'GET',
        params: toCalendarViewSearchParams(params),
      }),
      providesTags: [calendarModuleType.events, calendarModuleType.holiday],
    }),
  }),
});

export const { useGetCalendarViewQuery } = calendarModuleApi;
