import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import {
  unwrapDocuments,
  documentStageUrl,
  DOCUMENT_VERIFICATION_URL,
} from './admission-document-types';

import type {
  DocumentStageKey,
  DocumentRequirementAction,
  ApplicationDocumentVerification,
} from './admission-document-types';

const documentTags = [tags.admissionApplication];
const requirementUrl = (key: DocumentRequirementAction) =>
  `${documentStageUrl(key)}/requirements/${encodeURIComponent(key.code)}`;
export const admissionDocumentVerificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getApplicationDocuments: builder.query<ApplicationDocumentVerification, DocumentStageKey>({
      query: documentStageUrl,
      transformResponse: unwrapDocuments<ApplicationDocumentVerification>,
      providesTags: documentTags,
    }),
    uploadAdmissionDocument: builder.mutation<
      ApplicationDocumentVerification,
      DocumentRequirementAction & { file: File; notes?: string }
    >({
      query: ({ file, notes, ...key }) => {
        const body = new FormData();
        body.append('file', file);
        body.append('concurrencyStamp', key.concurrencyStamp);
        if (notes) body.append('notes', notes);
        return { url: `${requirementUrl(key)}/upload`, method: 'POST', body };
      },
      transformResponse: unwrapDocuments<ApplicationDocumentVerification>,
      invalidatesTags: documentTags,
    }),
    recordAdmissionDocumentOriginal: builder.mutation<
      ApplicationDocumentVerification,
      DocumentRequirementAction & { notes: string }
    >({
      query: ({ notes, ...key }) => ({
        url: `${requirementUrl(key)}/original`,
        method: 'POST',
        body: { concurrencyStamp: key.concurrencyStamp, notes },
      }),
      transformResponse: unwrapDocuments<ApplicationDocumentVerification>,
      invalidatesTags: documentTags,
    }),
    waiveAdmissionDocument: builder.mutation<
      ApplicationDocumentVerification,
      DocumentRequirementAction & { reason: string }
    >({
      query: ({ reason, ...key }) => ({
        url: `${requirementUrl(key)}/waive`,
        method: 'POST',
        body: { concurrencyStamp: key.concurrencyStamp, reason },
      }),
      transformResponse: unwrapDocuments<ApplicationDocumentVerification>,
      invalidatesTags: documentTags,
    }),
    reviewAdmissionDocument: builder.mutation<
      ApplicationDocumentVerification,
      {
        evidenceId: string;
        concurrencyStamp: string;
        decision: 'accepted' | 'rejected';
        reason?: string;
      }
    >({
      query: ({ evidenceId, ...body }) => ({
        url: `${DOCUMENT_VERIFICATION_URL}/evidence/${evidenceId}/review`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapDocuments<ApplicationDocumentVerification>,
      invalidatesTags: documentTags,
    }),
  }),
});
export const {
  useGetApplicationDocumentsQuery,
  useUploadAdmissionDocumentMutation,
  useRecordAdmissionDocumentOriginalMutation,
  useWaiveAdmissionDocumentMutation,
  useReviewAdmissionDocumentMutation,
} = admissionDocumentVerificationApi;
