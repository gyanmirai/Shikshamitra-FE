import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentAdmissionApi = createApi({
  reducerPath: 'StudentAdmissionApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Admission', 'Student-Document'],
  endpoints: (builder) => ({
    getStudentAdmission: builder.query({
      query: (params) => ({
        url: '/app/student-enrollment/student-admission',
        method: 'GET',
        params,
      }),
      providesTags: ['Student-Admission'],
    }),
    changeAdmissionStatus: builder.mutation({
      query: ({ body, approvalStatus }) => {
        let studentEnrollmentIds = '';
        body.forEach((item: any) => {
          studentEnrollmentIds += `studentEnrollmentIds=${item}&`;
        });

        return {
          url: `/student-enrollment/approval-status?approvalState=${approvalStatus}&${studentEnrollmentIds}`,
          method: 'PUT',
        };
      },
      invalidatesTags: ['Student-Admission'],
    }),
    assignDivisionTOStudent: builder.mutation({
      query: (body) => ({
        url: `/app/student-enrollment/student-enrollment-division`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Admission'],
    }),
  }),
});

export const {
  useGetStudentAdmissionQuery,
  useChangeAdmissionStatusMutation,
  useAssignDivisionTOStudentMutation,
} = StudentAdmissionApi;
