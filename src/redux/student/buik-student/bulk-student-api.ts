import { api } from 'src/redux/service';
import { bulkStudentType } from 'src/redux/tagTypes';

export const BulkStudentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addBulkStudent: builder.mutation({
      query: (data) => ({
        url: '/students/bulk-upload',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data,
      }),
      invalidatesTags: [bulkStudentType.studentDocumentType],
    }),
  }),
});

export const { useAddBulkStudentMutation } = BulkStudentApi;
