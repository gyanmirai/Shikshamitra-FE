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
        url: `/student-enrollment/registration?academicMediumId=${params.academicMediumId}`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    addStudentRegistration: builder.mutation({
      query: (body) => ({
        url: '/student-enrollment/registration',
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
      query: (enrollmentId) => ({
        url: `/app/student-enrollment/move-to-admission/${enrollmentId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getBasicDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student-enrollment/registration/${studentId}`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateBasicDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student-enrollment/registration/${id}/general`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getFamilyDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student-enrollment/registration/${studentId}/family`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateFamilyDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/family-details/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getParentBankDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student-enrollment/registration/${studentId}/parent-bank`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateParentBankDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/parent-bank-details/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getPreviousSchoolDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student-enrollment/registration/${studentId}/previous-school`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updatePreviousSchoolDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/previous-school-details/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getStudentAdditionalDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student-enrollment/registration/${studentId}/student-additional`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateStudentAdditionalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/student-additional-details/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getStudentCommunicationDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student-enrollment/registration/${studentId}/student-communication`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateStudentCommunicationDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/student-communication-details/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),
    getStudentMedicalDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/student-enrollment/registration/${studentId}/student-medical`,
        method: 'GET',
      }),
      providesTags: ['Student-Registration'],
    }),
    updateStudentMedicalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/student-medical-records/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration'],
    }),

    // document
    uploadDocuments: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student-enrollment/${id}/documents`,
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: body,
      }),
      invalidatesTags: ['Student-Document'],
    }),
    studentUpdateDocument: builder.mutation({
      query: ({ id, documentId, body }) => ({
        url: `/student-enrollment/${id}/documents/${documentId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: body,
      }),
      invalidatesTags: ['Student-Document'],
    }),
    getStudentDocuments: builder.query({
      query: (id) => ({
        url: `/student-enrollment/${id}/documents`,
      }),
      providesTags: ['Student-Document'],
    }),
    getStudentDocumentById: builder.query({
      query: ({ id, documentId }) => ({
        url: `/student-enrollment/${id}/documents/${documentId}`,
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
  useGetStudentDocumentByIdQuery,

  useGetBasicDetailsQuery,
  useGetFamilyDetailsQuery,
  useGetParentBankDetailsQuery,
  useGetPreviousSchoolDetailsQuery,
  useGetStudentAdditionalDetailsQuery,
  useGetStudentCommunicationDetailsQuery,
  useGetStudentMedicalDetailsQuery,
} = StudentRegistrationApi;
