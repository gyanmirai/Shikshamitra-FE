import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentAdmissionApi = createApi({
  reducerPath: 'StudentAdmissionApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Admission', 'Student-Document'],
  endpoints: (builder) => ({
    getStudentRegistration: builder.query({
      query: (params) => ({
        url: '/app/student-enrollment/student-admission',
        method: 'GET',
        params,
      }),
      providesTags: ['Student-Admission'],
    }),
  }),
});

export const { useGetStudentRegistrationQuery } = StudentAdmissionApi;
