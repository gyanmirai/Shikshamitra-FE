import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import { unwrapDocuments } from './admission-document-types';

import type { AdmissionDocumentEvidence } from './admission-document-types';

export type StudentAdmissionEvidence = Omit<AdmissionDocumentEvidence, 'sha256Hash'> & {
  applicationId: string;
  stageInstanceId: string;
  requirementCode: string;
  requirementLabel: string;
  documentTypeId?: string | null;
  studentLinkedAt?: string | null;
  studentLinkedBy?: string | null;
};
export const studentAdmissionEvidenceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentAdmissionEvidence: builder.query<StudentAdmissionEvidence[], string>({
      query: (studentId) => `/student/records/students/${studentId}/admission-evidence`,
      transformResponse: unwrapDocuments<StudentAdmissionEvidence[]>,
      providesTags: [tags.admissionApplication],
    }),
  }),
});
export const { useGetStudentAdmissionEvidenceQuery } = studentAdmissionEvidenceApi;
