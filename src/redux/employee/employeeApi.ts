import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/httpService';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Employee'],
  endpoints: (builder) => ({
    getEmployee: builder.query({
      query: () => ({ url: '/app/employee', redirect: 'follow' }),
      providesTags: ['Employee'],
    }),
    getEmployeeById: builder.query({
      query: (id) => ({ url: `/app/employee/${id}`, redirect: 'follow' }),
      providesTags: ['Employee'],
    }),
    addEmployee: builder.mutation({
      query: (body) => ({
        url: '/app/employee',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/employee/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/app/employee/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'],
    }),
  }),
});

export const {
  useAddEmployeeMutation,
  useDeleteEmployeeMutation,
  useLazyGetEmployeeByIdQuery,
  useLazyGetEmployeeQuery,
  useGetEmployeeByIdQuery,
  useGetEmployeeQuery,
  useUpdateEmployeeMutation,
} = employeeApi;
