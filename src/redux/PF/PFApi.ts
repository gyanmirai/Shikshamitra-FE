import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from '../hr/employeeApi';

export const pfApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getPF: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: '/payroll/pf-rules',
        method: 'GET',
        params: { academicYearId, ...params },
      }),
      providesTags: [employeeType.pf],
    }),

    addPF: builder.mutation({
      query: ({ body, academicYearId }) => ({
        url: '/payroll/pf-rules',
        method: 'POST',
        body,
        params: { academicYearId },
      }),
      invalidatesTags: [employeeType.pf],
    }),

    updatePF: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/pf-rules/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.pf],
    }),

    deletePF: builder.mutation({
      query: (id) => ({
        url: `/payroll/pf-rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.pf],
    }),
  }),
});

export const { useGetPFQuery, useAddPFMutation, useUpdatePFMutation, useDeletePFMutation } = pfApi;
