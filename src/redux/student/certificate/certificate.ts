import { api } from 'src/redux/service';
import { studentCertificateType } from 'src/redux/tagTypes';

export const StudentCertificateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadCertificate: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/students/upload-certificate?studentId=${studentId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentCertificateType.enrollmentReportApi],
    }),
  }),
});

export const { useUploadCertificateMutation } = StudentCertificateApi;
