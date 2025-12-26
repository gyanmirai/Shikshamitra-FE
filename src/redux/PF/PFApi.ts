import { employeeApi } from '../employee/employeeApi';

export const pfApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getPF: builder.query({
      query: () => ({
        url: '/payroll/pf-rules',
        method: 'GET',
      }),
      providesTags: ['PF'],
    }),

    addPF: builder.mutation({
      query: (body) => ({
        url: '/payroll/pf-rules',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['PF'],
    }),

    updatePF: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/pf-rules/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['PF'],
    }),

    deletePF: builder.mutation({
      query: (id) => ({
        url: `/payroll/pf-rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PF'],
    }),
  }),
});

export const { useGetPFQuery, useAddPFMutation, useUpdatePFMutation, useDeletePFMutation } = pfApi;
