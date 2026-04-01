import { api } from 'src/redux/service';
import { earningComponentType } from 'src/redux/tagTypes';

export const earningComponentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEarningComponents: builder.query({
      query: () => ({ url: '/payroll/earning-components' }),
      providesTags: [earningComponentType.earningComponent],
    }),

    createEarningComponent: builder.mutation({
      query: (body) => ({
        url: '/payroll/earning-components',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [earningComponentType.earningComponent],
    }),

    updateEarningComponent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [earningComponentType.earningComponent],
    }),

    deleteEarningComponent: builder.mutation({
      query: (id) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [earningComponentType.earningComponent],
    }),
  }),
});

export const {
  useGetEarningComponentsQuery,
  useCreateEarningComponentMutation,
  useUpdateEarningComponentMutation,
  useDeleteEarningComponentMutation,
} = earningComponentApi;
