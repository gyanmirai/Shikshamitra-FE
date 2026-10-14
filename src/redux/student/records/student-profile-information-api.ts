import { api } from 'src/redux/service';
import base64ToFile from 'src/utils/base64ToFile';
import { studentType, studentRegistrationType } from 'src/redux/tagTypes';

export type ProfileStudentDocumentRequirement = {
  documentTypeId: string;
  documentTypeName: string;
  isUploaded: boolean;
  uploadedDocumentId?: string | null;
  fileName?: string | null;
  creationTime?: string | null;
};
export type ProfileStudentDocumentFile = {
  fileName: string;
  contentType: string;
  content: string;
};
export type ProfileStudentDocumentUpload = ProfileStudentDocumentFile & {
  documentTypeId: string;
  size: number;
};
const unwrapDocument = <T>(response: T | { data: T }): T =>
  response && typeof response === 'object' && 'data' in response ? response.data : response;

export const profileInformationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfileBasicDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/general` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileBasicDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/general`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileFamilyDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/family` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileFamilyDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/family`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileStudentCommunicationDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/${studentId}/information/communication`,
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileStudentCommunicationDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/communication`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileStudentAdditionalDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/additional` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileStudentAdditionalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/additional`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileStudentMedicalDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/medical` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileStudentMedicalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/medical`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfilePreviousSchoolDetails: builder.query({
      query: ({ studentId }) => ({
        url: `/students/records/${studentId}/information/previous-school`,
      }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfilePreviousSchoolDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/previous-school`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileParentBankDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/bank` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileParentBankDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/bank`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileStudentDocuments: builder.query<
      ProfileStudentDocumentRequirement[],
      { studentId: string }
    >({
      query: ({ studentId }) => ({
        url: `/app/student-document/required-documents-status/${studentId}`,
      }),
      transformResponse: unwrapDocument<ProfileStudentDocumentRequirement[]>,
      providesTags: (_result, _error, { studentId }) => [
        { type: studentRegistrationType.studentDocument, id: studentId },
      ],
    }),
    uploadProfileStudentDocument: builder.mutation<
      { documentId: string },
      { studentId: string; body: ProfileStudentDocumentUpload }
    >({
      query: ({ studentId, body }) => ({
        url: `/app/student-document/upload-document/${studentId}`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapDocument<{ documentId: string }>,
      invalidatesTags: (_result, error, { studentId }) =>
        error ? [] : [{ type: studentRegistrationType.studentDocument, id: studentId }],
    }),
    getProfileStudentDocument: builder.query<
      ProfileStudentDocumentFile,
      { studentId: string; documentId: string }
    >({
      query: (params) => ({ url: '/app/student-document/document', params }),
      transformResponse: unwrapDocument<ProfileStudentDocumentFile>,
      // File contents are retained only while the preview is mounted, never in persisted client state.
      keepUnusedDataFor: 0,
    }),
    downloadProfileStudentDocument: builder.mutation<
      { downloaded: true },
      { studentId: string; documentId: string }
    >({
      async queryFn(params, _queryApi, _options, baseQuery) {
        const result = await baseQuery({ url: '/app/student-document/document', params });
        if (result.error) return { error: result.error };
        const file = unwrapDocument(
          result.data as ProfileStudentDocumentFile | { data: ProfileStudentDocumentFile }
        );
        if (!file?.content || !file.contentType)
          return {
            error: { status: 'CUSTOM_ERROR', error: 'The document could not be downloaded.' },
          };
        let objectUrl: string;
        try {
          objectUrl = URL.createObjectURL(
            base64ToFile(`data:${file.contentType};base64,${file.content}`)
          );
        } catch {
          return {
            error: { status: 'CUSTOM_ERROR', error: 'The document could not be downloaded.' },
          };
        }
        const anchor = document.createElement('a');
        try {
          anchor.href = objectUrl;
          anchor.download = file.fileName?.split(/[\\/]/).at(-1) || 'student-document';
          document.body.appendChild(anchor);
          anchor.click();
        } finally {
          anchor.remove();
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        }
        return { data: { downloaded: true } };
      },
    }),
  }),
});

export const {
  useGetProfileStudentDocumentsQuery,
  useUploadProfileStudentDocumentMutation,
  useGetProfileStudentDocumentQuery,
  useDownloadProfileStudentDocumentMutation,
  useGetProfileBasicDetailsQuery: useGetBasicDetailsQuery,
  useUpdateProfileBasicDetailsMutation: useUpdateBasicDetailsMutation,
  useGetProfileFamilyDetailsQuery: useGetFamilyDetailsQuery,
  useUpdateProfileFamilyDetailsMutation: useUpdateFamilyDetailsMutation,
  useGetProfileStudentCommunicationDetailsQuery: useGetStudentCommunicationDetailsQuery,
  useUpdateProfileStudentCommunicationDetailsMutation: useUpdateStudentCommunicationDetailsMutation,
  useGetProfileStudentAdditionalDetailsQuery: useGetStudentAdditionalDetailsQuery,
  useUpdateProfileStudentAdditionalDetailsMutation: useUpdateStudentAdditionalDetailsMutation,
  useGetProfileStudentMedicalDetailsQuery: useGetStudentMedicalDetailsQuery,
  useUpdateProfileStudentMedicalDetailsMutation: useUpdateStudentMedicalDetailsMutation,
  useGetProfilePreviousSchoolDetailsQuery: useGetPreviousSchoolDetailsQuery,
  useUpdateProfilePreviousSchoolDetailsMutation: useUpdatePreviousSchoolDetailsMutation,
  useGetProfileParentBankDetailsQuery: useGetParentBankDetailsQuery,
  useUpdateProfileParentBankDetailsMutation: useUpdateParentBankDetailsMutation,
} = profileInformationApi;
