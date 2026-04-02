import { api } from 'src/redux/service';
import { inquiryPreferenceType } from 'src/redux/tagTypes';

export const inquiryPreferenceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInquiryPreference: builder.query({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/${academicYearId}/settings/inquiry-preferences`,
        method: 'GET',
      }),
      providesTags: [inquiryPreferenceType.studentDocumentType],
    }),
    addInquiryPreference: builder.mutation({
      query: ({ academicYearId, data }) => ({
        url: `/student-enrollment/${academicYearId}/settings/inquiry-preferences`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [inquiryPreferenceType.studentDocumentType],
    }),
    updateInquiryPreference: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student-enrollment/settings/inquiry-preferences/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [inquiryPreferenceType.studentDocumentType],
    }),
    deleteInquiryPreference: builder.mutation({
      query: (id) => ({
        url: `/student-enrollment/settings/inquiry-preferences/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [inquiryPreferenceType.studentDocumentType],
    }),
  }),
});

export const {
  useAddInquiryPreferenceMutation,
  useUpdateInquiryPreferenceMutation,
  useDeleteInquiryPreferenceMutation,
  useGetInquiryPreferenceQuery,
} = inquiryPreferenceApi;
