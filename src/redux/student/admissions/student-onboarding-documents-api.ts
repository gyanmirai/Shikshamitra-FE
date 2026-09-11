import { api } from 'src/redux/service';
import { studentType, studentRegistrationType, studentAdmissionsCrmType } from 'src/redux/tagTypes';

import { unwrapDocuments } from './admission-document-types';

export type StudentOnboardingDocument = {
  documentTypeId: string;
  name: string;
  isRequired: boolean;
  maxSizeMb: number;
  allowedExtensions: string[];
  studentDocumentId?: string | null;
  fileName?: string | null;
  hasStudentUpload: boolean;
  hasAcceptedAdmissionEvidence: boolean;
};
export type StudentOnboardingDocuments = {
  caseId: string;
  studentId: string;
  concurrencyStamp: string;
  canUpload: boolean;
  documents: StudentOnboardingDocument[];
};

export const studentOnboardingDocumentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentOnboardingDocuments: builder.query<StudentOnboardingDocuments, string>({
      query: (caseId) => `/student/onboarding/${caseId}/documents`,
      transformResponse: unwrapDocuments<StudentOnboardingDocuments>,
      providesTags: [
        studentAdmissionsCrmType.studentOnboarding,
        studentRegistrationType.studentDocument,
      ],
    }),
    uploadStudentOnboardingDocument: builder.mutation<
      StudentOnboardingDocuments,
      {
        caseId: string;
        documentTypeId: string;
        concurrencyStamp: string;
        file: File;
      }
    >({
      query: ({ caseId, documentTypeId, concurrencyStamp, file }) => {
        const body = new FormData();
        body.append('documentTypeId', documentTypeId);
        body.append('concurrencyStamp', concurrencyStamp);
        body.append('file', file);
        return { url: `/student/onboarding/${caseId}/documents`, method: 'POST', body };
      },
      transformResponse: unwrapDocuments<StudentOnboardingDocuments>,
      invalidatesTags: [
        studentAdmissionsCrmType.studentOnboarding,
        studentRegistrationType.studentDocument,
        studentType.student,
      ],
    }),
  }),
  overrideExisting: true,
});

export const { useGetStudentOnboardingDocumentsQuery, useUploadStudentOnboardingDocumentMutation } =
  studentOnboardingDocumentsApi;
