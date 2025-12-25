import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentRegistrationApi = createApi({
  reducerPath: 'StudentRegistrationApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Registration', 'Student-Document'],
  endpoints: (builder) => ({
    getStudentRegistration: builder.query({
      query: (params) => ({
        url: `/student/enrollment/registrations?academicMediumId=${params.academicMediumId}`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    addStudentRegistration: builder.mutation({
      query: (body) => ({
        url: '/student/enrollment/registrations/general-details',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    updateStudentRegistration: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/student-registration/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),

    deleteStudentRegistration: builder.mutation({
      query: (id) => ({
        url: `/app/student-enrollment/student-registration/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    moveToRegistration: builder.mutation({
      query: (enrollmentId) => ({
        url: `/app/student-enrollment/move-to-registration/${enrollmentId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    moveToAdmission: builder.mutation({
      query: (studentId) => ({
        url: `/student-enrollment/entrance-exam/${studentId}/move-to-admission`,
        method: 'POST',
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getBasicDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/general-details`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateBasicDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/general-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getFamilyDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/family-details`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateFamilyDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/family-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getParentBankDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/bank-details`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateParentBankDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/bank-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getPreviousSchoolDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/previous-school-details`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updatePreviousSchoolDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/previous-school-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getStudentAdditionalDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/additional-details`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateStudentAdditionalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/additional-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getStudentCommunicationDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/communication-details`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateStudentCommunicationDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/communication-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getStudentMedicalDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/medical-records`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateStudentMedicalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student/enrollment/registrations/${id}/medical-records`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),

    // document
    uploadDocuments: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/app/student-document/upload-document/${studentId}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Student-Document'],
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
      invalidatesTags: ['Student-Document'],
    }),
    getStudentDocuments: builder.query({
      query: ({ studentId }) => ({
        url: `/app/student-document/required-documents-status/${studentId}`,
      }),
      providesTags: ['Student-Document'],
    }),
    getStudentDocumentList: builder.query({
      query: ({ studentId }) => ({
        url: `/app/student-document/document-list/${studentId}`,
      }),
      providesTags: ['Student-Document'],
    }),
    getStudentDocumentById: builder.query({
      query: ({ studentId, documentId }) => ({
        url: `/app/student-document/document?studentId=${studentId}&documentId=${documentId}`,
      }),
      providesTags: ['Student-Document'],
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

  useGetBasicDetailsQuery,
  useGetFamilyDetailsQuery,
  useGetParentBankDetailsQuery,
  useGetPreviousSchoolDetailsQuery,
  useGetStudentAdditionalDetailsQuery,
  useGetStudentCommunicationDetailsQuery,
  useGetStudentMedicalDetailsQuery,
} = StudentRegistrationApi;
