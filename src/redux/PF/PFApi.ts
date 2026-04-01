import { employeeApi } from '../hr/employeeApi';
import { employeeType } from 'src/redux/tagTypes';


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
        data: body,
        params: { academicYearId },
      }),
      invalidatesTags: [employeeType.pf],
    }),

    updatePF: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/pf-rules/${id}`,
        method: 'PUT',
        data: body,
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
