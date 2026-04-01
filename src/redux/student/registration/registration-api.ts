import { api } from 'src/redux/service';
import { studentRegistrationType } from 'src/redux/tagTypes';

export const StudentRegistrationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentRegistration: builder.query({
      query: (params) => ({
        url: `/student/enrollment/registrations?academicMediumId=${params.academicMediumId}`,
        method: 'GET',
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    addStudentRegistration: builder.mutation({
      query: (body) => ({
        url: '/student/enrollment/registrations/general-details',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    updateStudentRegistration: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/student-registration/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),

    deleteStudentRegistration: builder.mutation({
      query: (id) => ({
        url: `/app/student-enrollment/student-registration/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    moveToRegistration: builder.mutation({
      query: (enrollmentId) => ({
        url: `/app/student-enrollment/move-to-registration/${enrollmentId}`,
        method: 'POST',
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    moveToAdmission: builder.mutation({
      query: (studentId) => ({
        url: `/student-enrollment/entrance-exam/${studentId}/move-to-admission`,
        method: 'POST',
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    getBasicDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/general-details`,
        method: 'GET',
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateBasicDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/general-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    getFamilyDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/family-details`,
        method: 'GET',
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateFamilyDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/family-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    getParentBankDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/bank-details`,
        method: 'GET',
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateParentBankDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/bank-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    getPreviousSchoolDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/previous-school-details`,
        method: 'GET',
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updatePreviousSchoolDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/previous-school-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    getStudentAdditionalDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/additional-details`,
        method: 'GET',
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateStudentAdditionalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/additional-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    getStudentCommunicationDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/communication-details`,
        method: 'GET',
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateStudentCommunicationDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/communication-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    getStudentMedicalDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/medical-records`,
        method: 'GET',
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateStudentMedicalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/medical-records`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),

    // document
    uploadDocuments: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/app/student-document/upload-document/${studentId}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentDocument],
    }),
    studentUpdateDocument: builder.mutation({
      query: ({ studentId, documentId, body }) => ({
        url: `/student-enrollment/${studentId}/documents/${documentId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: body,
      }),
      invalidatesTags: [studentRegistrationType.studentDocument],
    }),
    getStudentDocuments: builder.query({
      query: ({ studentId }) => ({
        url: `/app/student-document/required-documents-status/${studentId}`,
      }),
      providesTags: [studentRegistrationType.studentDocument],
    }),
    getStudentDocumentList: builder.query({
      query: ({ studentId }) => ({
        url: `/app/student-document/document-list/${studentId}`,
      }),
      providesTags: [studentRegistrationType.studentDocument],
    }),
    getStudentDocumentById: builder.query({
      query: ({ studentId, documentId }) => ({
        url: `/app/student-document/document?studentId=${studentId}&documentId=${documentId}`,
      }),
      providesTags: [studentRegistrationType.studentDocument],
    }),
  }),
});

export const {
  useAddStudentRegistrationMutation,
  useDeleteStudentRegistrationMutation,
  useGetStudentRegistrationQuery,
  useUpdateStudentRegistrationMutation,
  useMoveToRegistrationMutation,
  useMoveToAdmissionMutation,
  useUpdateBasicDetailsMutation,
  useUpdateFamilyDetailsMutation,
  useUpdateParentBankDetailsMutation,
  useUpdatePreviousSchoolDetailsMutation,
  useUpdateStudentAdditionalDetailsMutation,
  useUpdateStudentCommunicationDetailsMutation,
  useUpdateStudentMedicalDetailsMutation,

  useUploadDocumentsMutation,
  useStudentUpdateDocumentMutation,
  useGetStudentDocumentsQuery,
  useGetStudentDocumentListQuery,
  useGetStudentDocumentByIdQuery,
  useLazyGetStudentDocumentByIdQuery,

  useGetBasicDetailsQuery,
  useGetFamilyDetailsQuery,
  useGetParentBankDetailsQuery,
  useGetPreviousSchoolDetailsQuery,
  useGetStudentAdditionalDetailsQuery,
  useGetStudentCommunicationDetailsQuery,
  useGetStudentMedicalDetailsQuery,
} = StudentRegistrationApi;
