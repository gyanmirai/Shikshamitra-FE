import { api } from 'src/redux/service';
import { studentType, studentRegistrationType } from 'src/redux/tagTypes';

const unwrapResultData = (response: any) =>
  response && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response;

export const StudentRegistrationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentRegistration: builder.query({
      query: (params) => ({
        url: '/student/enrollment/registrations',
        method: 'GET',
        params,
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    addStudentRegistration: builder.mutation({
      query: (body) => ({
        url: '/student/enrollment/registrations/general-details',
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    updateStudentRegistration: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/student-registration/${id}`,
        method: 'PUT',
        body,
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
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    getStudentIdentityCompliance: builder.query({
      query: ({ studentId }) => ({
        url: `/student/${studentId}/identity-compliance`,
        method: 'GET',
      }),
      transformResponse: unwrapResultData,
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateStudentIdentityCompliance: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student/${studentId}/identity-compliance`,
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapResultData,
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    updateAadhaarVerificationStatus: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student/${studentId}/identity-compliance/aadhaar-verification-status`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapResultData,
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),
    updateApaarConsent: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student/${studentId}/identity-compliance/apaar-consent`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapResultData,
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
        body,
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
        body,
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
        body,
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
        body,
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
        body,
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
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration],
    }),

    // document
    uploadStudentDocuments: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student/enrollment/registrations/${studentId}/documents`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapResultData,
      invalidatesTags: [studentRegistrationType.studentDocument, studentType.student],
    }),
    getStudentDocuments: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/documents/required-status`,
      }),
      transformResponse: unwrapResultData,
      providesTags: [studentRegistrationType.studentDocument],
    }),
    getStudentDocumentList: builder.query({
      query: ({ studentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/documents`,
      }),
      transformResponse: unwrapResultData,
      providesTags: [studentRegistrationType.studentDocument],
    }),
    downloadStudentDocument: builder.query({
      query: ({ studentId, documentId }) => ({
        url: `/student/enrollment/registrations/${studentId}/documents/${documentId}`,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: [studentRegistrationType.studentDocument],
    }),
    searchStudentRegistrations: builder.query({
      query: ({ searchTerm }) => ({
        url: `/student/enrollment/registrations/search`,
        method: 'GET',
        params: { searchTerm },
      }),
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
  useGetStudentIdentityComplianceQuery,
  useUpdateStudentIdentityComplianceMutation,
  useUpdateAadhaarVerificationStatusMutation,
  useUpdateApaarConsentMutation,
  useUpdateFamilyDetailsMutation,
  useUpdateParentBankDetailsMutation,
  useUpdatePreviousSchoolDetailsMutation,
  useUpdateStudentAdditionalDetailsMutation,
  useUpdateStudentCommunicationDetailsMutation,
  useUpdateStudentMedicalDetailsMutation,

  useUploadStudentDocumentsMutation,
  useGetStudentDocumentsQuery,
  useGetStudentDocumentListQuery,
  useDownloadStudentDocumentQuery,
  useLazyDownloadStudentDocumentQuery,

  useGetBasicDetailsQuery,
  useGetFamilyDetailsQuery,
  useGetParentBankDetailsQuery,
  useGetPreviousSchoolDetailsQuery,
  useGetStudentAdditionalDetailsQuery,
  useGetStudentCommunicationDetailsQuery,
  useGetStudentMedicalDetailsQuery,
  useLazySearchStudentRegistrationsQuery,
} = StudentRegistrationApi;
