import { api } from 'src/redux/service';
import { shiftManagementType } from 'src/redux/tagTypes';

export const shiftManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addShift: builder.mutation({
      query: (body) => ({
        url: '/app/shift-management/',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [shiftManagementType.shift],
    }),
    getShiftById: builder.query({
      query: (id) => ({
        url: `/app/shift-management/${id}`,
      }),
      providesTags: [shiftManagementType.shift],
    }),
    updateShift: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/shift-management/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [shiftManagementType.shift],
    }),
    deleteShift: builder.mutation({
      query: (id) => ({
        url: `/app/shift-management/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [shiftManagementType.shift],
    }),
    getShifts: builder.query({
      query: () => ({
        url: `/app/shift-management`,
      }),
      providesTags: [shiftManagementType.shift],
    }),
  }),
});

export const {
  useAddShiftMutation,
  useDeleteShiftMutation,
  useGetShiftByIdQuery,
  useUpdateShiftMutation,
  useGetShiftsQuery,
} = shiftManagementApi;
