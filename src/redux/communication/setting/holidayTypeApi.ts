import { communicationApi } from '../communicationApi';
import { communicationType } from 'src/redux/tagTypes';


export const holidayTypeOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getHolidayTypeOptions: builder.query({
      query: () => ({
        url: '/calendar/holiday-types',
        method: 'GET',
      }),
      providesTags: [communicationType.holidayTypeOptions],
    }),

    addHolidayType: builder.mutation({
      query: (data) => ({
        url: '/calendar/holiday-types',
        method: 'POST',
        data,
      }),
      invalidatesTags: [communicationType.holidayTypeOptions],
    }),

    updateHolidayType: builder.mutation({
      query: ({ data, holidayTypeId }) => ({
        url: `/calendar/holiday-types/${holidayTypeId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: [communicationType.holidayTypeOptions],
    }),

    deleteHolidayType: builder.mutation({
      query: (holidayTypeId) => ({
        url: `/calendar/holiday-types/${holidayTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [communicationType.holidayTypeOptions],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHolidayTypeOptionsQuery,
  useAddHolidayTypeMutation,
  useUpdateHolidayTypeMutation,
  useDeleteHolidayTypeMutation,
} = holidayTypeOptionsApi;
