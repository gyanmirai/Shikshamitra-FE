import { api } from 'src/redux/service';
import { studentType, studentRecordProfileType } from 'src/redux/tagTypes';

const unwrapResultData = (response: any) =>
  response && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response;

export const StudentRecordProfileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBasicDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/profiles/${studentId}/general-details`,
        method: 'GET',
      }),
      providesTags: [studentRecordProfileType.studentProfile],
    }),
    updateBasicDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/profiles/${id}/general-details`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRecordProfileType.studentProfile],
    }),
    getStudentIdentityCompliance: builder.query({
      query: ({ studentId }) => ({
        url: `/student/${studentId}/identity-compliance`,
        method: 'GET',
      }),
      transformResponse: unwrapResultData,
      providesTags: [studentRecordProfileType.studentProfile],
    }),
    updateStudentIdentityCompliance: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student/${studentId}/identity-compliance`,
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapResultData,
      invalidatesTags: [studentRecordProfileType.studentProfile],
    }),
    updateAadhaarVerificationStatus: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student/${studentId}/identity-compliance/aadhaar-verification-status`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapResultData,
      invalidatesTags: [studentRecordProfileType.studentProfile],
    }),
    updateApaarConsent: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student/${studentId}/identity-compliance/apaar-consent`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapResultData,
      invalidatesTags: [studentRecordProfileType.studentProfile],
    }),
    getFamilyDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/profiles/${studentId}/family-details`,
        method: 'GET',
      }),
      providesTags: [studentRecordProfileType.studentProfile],
    }),
    updateFamilyDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/profiles/${id}/family-details`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRecordProfileType.studentProfile],
    }),
    getParentBankDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/profiles/${studentId}/bank-details`,
        method: 'GET',
      }),
      providesTags: [studentRecordProfileType.studentProfile],
    }),
    updateParentBankDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/profiles/${id}/bank-details`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRecordProfileType.studentProfile],
    }),
    getPreviousSchoolDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/profiles/${studentId}/previous-school-details`,
        method: 'GET',
      }),
      providesTags: [studentRecordProfileType.studentProfile],
    }),
    updatePreviousSchoolDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/profiles/${id}/previous-school-details`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRecordProfileType.studentProfile],
    }),
    getStudentAdditionalDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/profiles/${studentId}/additional-details`,
        method: 'GET',
      }),
      providesTags: [studentRecordProfileType.studentProfile],
    }),
    updateStudentAdditionalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/profiles/${id}/additional-details`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRecordProfileType.studentProfile],
    }),
    getStudentCommunicationDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/profiles/${studentId}/communication-details`,
        method: 'GET',
      }),
      providesTags: [studentRecordProfileType.studentProfile],
    }),
    updateStudentCommunicationDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/profiles/${id}/communication-details`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRecordProfileType.studentProfile],
    }),
    getStudentMedicalDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/profiles/${studentId}/medical-records`,
        method: 'GET',
      }),
      providesTags: [studentRecordProfileType.studentProfile],
    }),
    updateStudentMedicalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/profiles/${id}/medical-records`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRecordProfileType.studentProfile],
    }),

    // document
    uploadStudentDocuments: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/students/records/profiles/${studentId}/documents`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapResultData,
      invalidatesTags: [studentRecordProfileType.studentDocument, studentType.student],
    }),
    getStudentDocuments: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/profiles/${studentId}/documents/required-status`,
      }),
      transformResponse: unwrapResultData,
      providesTags: [studentRecordProfileType.studentDocument],
    }),
    getStudentDocumentList: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/profiles/${studentId}/documents`,
      }),
      transformResponse: unwrapResultData,
      providesTags: [studentRecordProfileType.studentDocument],
    }),
    downloadStudentDocument: builder.query({
      query: ({ studentId, documentId }) => ({
        url: `/students/records/profiles/${studentId}/documents/${documentId}`,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: [studentRecordProfileType.studentDocument],
    }),
    searchStudentRegistrations: builder.query({
      query: ({ searchTerm }) => ({
        url: `/students/records/profiles/search`,
        method: 'GET',
        params: { searchTerm },
      }),
    }),
  }),
});

export const {
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
} = StudentRecordProfileApi;
