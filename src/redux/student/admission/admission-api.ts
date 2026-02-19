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
      query: ({ approvalStatus }) => ({
        url: `/students/admissions?ApprovalStatus=${approvalStatus}`,
        method: 'GET',
      }),
      providesTags: ['Student-Admission'],
    }),
    changeAdmissionStatus: builder.mutation({
      query: ({ body }) => ({
        url: `/students/admissions/status`,
        method: 'POST',
        data: { items: body },
      }),
      invalidatesTags: ['Student-Admission'],
    }),
    assignDivisionTOStudent: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/students/admissions/${studentId}/division`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Admission'],
    }),

    getDivisionForStandard: builder.query({
      query: (standardId) => ({
        url: `/app/standard/${standardId}`,
        method: 'GET',
      }),
      providesTags: ['Student-Admission'],
    }),
    getStandardFeeStructure: builder.query({
      query: (studentId) => ({
        url: `/student-fee-structure/student/${studentId}`,
        method: 'GET',
      }),
      providesTags: ['Student-Admission'],
    }),
    assignFeeStructure: builder.mutation({
      query: ({ body }) => ({
        url: `/student-fee-structure/assign`,
        method: 'POST',
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
  useGetDivisionForStandardQuery,
  useAssignFeeStructureMutation,
  useGetStandardFeeStructureQuery,
} = StudentAdmissionApi;
