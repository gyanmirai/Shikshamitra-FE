import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const EnrollmentReportApi = createApi({
  reducerPath: 'EnrollmentReportApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Enrollment-Report-Api'],
  endpoints: (builder) => ({
    generateReport: builder.mutation({
      query: (reportType) => ({
        url: `/app/student-enrollment/generate-report?reportType=${reportType}`,
        method: 'POST',
      }),
      invalidatesTags: ['Enrollment-Report-Api'],
    }),
  }),
});

export const { useGenerateReportMutation } = EnrollmentReportApi;
