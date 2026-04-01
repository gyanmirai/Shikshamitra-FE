import { api } from 'src/redux/service';
import { enrollmentReportType } from 'src/redux/tagTypes';

export const EnrollmentReportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generateReport: builder.mutation({
      query: (reportType) => ({
        url: `/app/student-enrollment/generate-report?reportType=${reportType}`,
        method: 'POST',
      }),
      invalidatesTags: [enrollmentReportType.enrollmentReportApi],
    }),
  }),
});

export const { useGenerateReportMutation } = EnrollmentReportApi;
