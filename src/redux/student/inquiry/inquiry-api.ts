import { api } from 'src/redux/service';
import { studentInquiryType } from 'src/redux/tagTypes';

export const StudentInquiryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentInquiry: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/student/enrollment/${academicMediumId}/inquiries`,
        method: 'GET',
      }),
      providesTags: [studentInquiryType.studentInquiry],
    }),
    addStudentInquiry: builder.mutation({
      query: (body) => ({
        url: '/student/enrollment/inquiries',
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentInquiryType.studentInquiry],
    }),
    getStudentInquiryById: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/inquiries/${studentId}`,
        method: 'GET',
      }),
      providesTags: [studentInquiryType.studentInquiry],
    }),
    updateStudentInquiry: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/inquiries/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentInquiryType.studentInquiry],
    }),

    deleteStudentInquiry: builder.mutation({
      query: (id) => ({
        url: `/app/student-enrollment/student-inquiry/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentInquiryType.studentInquiry],
    }),

    registrationFormDetails: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student/enrollment/registrations/${studentId}/forms`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentInquiryType.studentInquiry],
    }),
  }),
});

export const {
  useAddStudentInquiryMutation,
  useDeleteStudentInquiryMutation,
  useGetStudentInquiryQuery,
  useUpdateStudentInquiryMutation,
  useRegistrationFormDetailsMutation,
  useGetStudentInquiryByIdQuery,
} = StudentInquiryApi;
