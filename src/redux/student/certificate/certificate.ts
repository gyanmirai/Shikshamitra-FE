import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentCertificateApi = createApi({
  reducerPath: 'StudentCertificateApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Enrollment-Report-Api'],
  endpoints: (builder) => ({
    uploadCertificate: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/students/upload-certificate?studentId=${studentId}`,
        method: 'POST',
        data: body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ['Enrollment-Report-Api'],
    }),
  }),
});

export const { useUploadCertificateMutation } = StudentCertificateApi;
