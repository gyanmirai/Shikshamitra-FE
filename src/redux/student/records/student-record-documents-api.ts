import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

import { unwrapRecordsResult } from './student-records-api';

export type CertificateType = 1 | 2 | 3 | 4;
export type CertificateTemplate = { id?: string | null; certificateType: CertificateType; headerContent: string; footerContent: string; logoUrl?: string | null; schoolAddress?: string | null; principalSignatureUrl?: string | null; schoolStampUrl?: string | null; isActive: boolean };
export type CertificatePreviewInput = { studentId: string; certificateType: CertificateType; transitionId?: string; issueDate?: string; certificateFields: Record<string, string> };
export type CertificateResponse = { certificateId?: string | null; certificateNo: string; certificateType: string; issueDate: string; status: string; transitionId?: string | null; student: { studentId: string; studentName: string; grNo?: string | null; className?: string | null; divisionName?: string | null }; template: { renderedHeaderContent: string; renderedFooterContent: string }; certificateData: Record<string, string | null> };
export type CertificateHistory = { certificateId: string; certificateNumber: string; certificateType: string; issueDate: string; status: string; createdDate: string; transitionId?: string | null; sourceCertificateId?: string | null; supportedActions: string[] };
export type CertificateBatch = { id: string; certificateType: string; generatedAt: string; firstCertificateNumber: string; lastCertificateNumber: string; studentCount: number; status: string };
export type CertificateBatchDetail = { id: string; certificates: CertificateResponse[] };
export type CertificateBatchQuery = { certificateType: CertificateType; generatedFrom: string; generatedTo: string; skipCount: number; maxResultCount: number };
export type IdCardSelection = { academicYearId?: string | null; boardIds: string[]; mediumIds: string[]; standardIds: string[]; divisionIds: string[]; studentIds: string[] };
export type IdCardTemplate = { id?: string | null; name: string; presetKey: string; orientation: 'Horizontal' | 'Vertical'; schoolName: string; schoolAddress: string; headerText: string; footerText: string; primaryColor: string; backgroundColor: string; cardsPerPage: number; showQrCode: boolean; showPhoto: boolean; fields: string[]; selection?: IdCardSelection; concurrencyStamp?: string | null };
export type IdCard = { id?: string | null; studentId: string; cardNumber: string; status: string; issuedAt?: string | null; issuedByUserId?: string | null; hasPhoto: boolean; studentSnapshot: Record<string, string | null>; templateSnapshot: IdCardTemplate };
export type GuardianLink = { linkId: string; userId: string; relationship: string; email: string; emailConfirmed: boolean; isActive: boolean };
export type GuardianReview = { id: string; studentId: string; changeRequestId: string; status: string; concurrencyStamp: string; onApprovedChangeMode: 'SuspendUntilReview' | 'KeepUntilReview'; previousLinks: GuardianLink[]; creationTime: string; reviewedByUserId?: string | null; reviewedAt?: string | null };
export type ResolveGuardianReview = { reviewId: string; concurrencyStamp: string; reason: string; revokeLinkIds: string[]; keepLinkIds: string[]; confirmRetainedGuardiansVerified: boolean; newGuardian?: { relationship: 'father' | 'mother' | 'guardian'; email: string; existingUserId?: string; confirmIdentityVerified: boolean } };
const documentTags = [{ type: studentType.student, id: 'RECORDS-DOCUMENTS' }];
const guardianTags = [{ type: studentType.student, id: 'RECORDS-GUARDIAN-ACCESS' }];
const unwrap = <T>(response: T | { data?: T }) => unwrapRecordsResult(response);
const blobResponse = (response: Response) => response.ok ? response.blob() : response.json();

export const studentRecordDocumentsApi = api.injectEndpoints({
  endpoints: builder => ({
    getRecordCertificateBatches: builder.query<{ items: CertificateBatch[]; totalCount: number }, CertificateBatchQuery>({ query: params => ({ url: '/students/records/certificates/batches', params }), transformResponse: unwrap<{ items: CertificateBatch[]; totalCount: number }>, providesTags: documentTags }),
    getRecordCertificateBatch: builder.query<CertificateBatchDetail, { batchId: string; certificateType: CertificateType }>({ query: ({ batchId, certificateType }) => ({ url: `/students/records/certificates/batches/${batchId}`, params: { certificateType } }), transformResponse: unwrap<CertificateBatchDetail>, providesTags: documentTags }),
    getRecordCertificateTemplate: builder.query<CertificateTemplate, CertificateType>({ query: type => `/students/records/certificates/templates/${type}`, transformResponse: unwrap<CertificateTemplate>, providesTags: documentTags }),
    saveRecordCertificateTemplate: builder.mutation<CertificateTemplate, CertificateTemplate>({ query: body => ({ url: `/students/records/certificates/templates/${body.certificateType}`, method: 'PUT', body }), transformResponse: unwrap<CertificateTemplate>, invalidatesTags: (_result, error) => error ? [] : documentTags }),
    previewRecordCertificate: builder.mutation<CertificateResponse, CertificatePreviewInput>({ query: body => ({ url: '/students/records/certificates/preview', method: 'POST', body }), transformResponse: unwrap<CertificateResponse> }),
    issueRecordCertificate: builder.mutation<CertificateResponse, CertificatePreviewInput & { idempotencyKey: string }>({ query: body => ({ url: '/students/records/certificates', method: 'POST', body }), transformResponse: unwrap<CertificateResponse>, invalidatesTags: (_result, error) => error ? [] : documentTags }),
    getRecordCertificateHistory: builder.query<CertificateHistory[], string>({ query: studentId => `/students/records/certificates/students/${studentId}/history`, transformResponse: unwrap<CertificateHistory[]>, providesTags: documentTags }),
    getRecordIdTemplate: builder.query<IdCardTemplate, void>({ query: () => '/students/records/ids/templates', transformResponse: unwrap<IdCardTemplate>, providesTags: documentTags }),
    saveRecordIdTemplate: builder.mutation<IdCardTemplate, IdCardTemplate>({ query: body => ({ url: '/students/records/ids/templates', method: 'PUT', body }), transformResponse: unwrap<IdCardTemplate>, invalidatesTags: (_result, error) => error ? [] : documentTags }),
    getRecordIdTemplates: builder.query<IdCardTemplate[], void>({ query: () => '/students/records/ids/templates/list', transformResponse: unwrap<IdCardTemplate[]>, providesTags: documentTags }),
    createRecordIdTemplate: builder.mutation<IdCardTemplate, IdCardTemplate>({ query: body => ({ url: '/students/records/ids/templates', method: 'POST', body }), transformResponse: unwrap<IdCardTemplate>, invalidatesTags: (_result, error) => error ? [] : documentTags }),
    updateRecordIdTemplate: builder.mutation<IdCardTemplate, { id: string; body: IdCardTemplate }>({ query: ({ id, body }) => ({ url: `/students/records/ids/templates/${id}`, method: 'PUT', body }), transformResponse: unwrap<IdCardTemplate>, invalidatesTags: (_result, error) => error ? [] : documentTags }),
    deleteRecordIdTemplate: builder.mutation<void, string>({ query: id => ({ url: `/students/records/ids/templates/${id}`, method: 'DELETE' }), invalidatesTags: (_result, error) => error ? [] : documentTags }),
    previewRecordIds: builder.mutation<IdCard[], { studentIds: string[]; templateId?: string }>({ query: body => ({ url: '/students/records/ids/preview', method: 'POST', body }), transformResponse: unwrap<IdCard[]> }),
    issueRecordIds: builder.mutation<IdCard[], { studentIds: string[]; idempotencyKey: string; templateId?: string }>({ query: body => ({ url: '/students/records/ids/issue', method: 'POST', body }), transformResponse: unwrap<IdCard[]>, invalidatesTags: (_result, error) => error ? [] : documentTags }),
    exportRecordIds: builder.mutation<Blob, { studentIds: string[]; cardsPerPage: number; templateId?: string }>({ query: body => ({ url: '/students/records/ids/export', method: 'POST', body, responseHandler: blobResponse }) }),
    getRecordIdHistory: builder.query<IdCard[], string>({ query: studentId => `/students/records/ids/students/${studentId}/history`, transformResponse: unwrap<IdCard[]>, providesTags: documentTags }),
    downloadRecordDocument: builder.mutation<Blob, { kind: 'certificates' | 'ids'; id: string }>({ query: ({ kind, id }) => ({ url: `/students/records/${kind}/${id}/pdf`, responseHandler: blobResponse }) }),
    reprintRecordDocument: builder.mutation<Blob, { kind: 'certificates' | 'ids'; id: string; reason: string }>({ query: ({ kind, id, reason }) => ({ url: `/students/records/${kind}/${id}/reprint`, method: 'POST', body: { reason }, responseHandler: blobResponse }), invalidatesTags: (_result, error) => error ? [] : documentTags }),
    voidRecordDocument: builder.mutation<CertificateResponse | IdCard, { kind: 'certificates' | 'ids'; id: string; reason: string }>({ query: ({ kind, id, reason }) => ({ url: `/students/records/${kind}/${id}/void`, method: 'POST', body: { reason } }), invalidatesTags: (_result, error) => error ? [] : documentTags }),
    duplicateRecordCertificate: builder.mutation<CertificateResponse, { id: string; reason: string; idempotencyKey: string }>({ query: ({ id, reason, idempotencyKey }) => ({ url: `/students/records/certificates/${id}/duplicate`, method: 'POST', body: { reason, idempotencyKey } }), transformResponse: unwrap<CertificateResponse>, invalidatesTags: (_result, error) => error ? [] : documentTags }),
    getRecordGuardianLinks: builder.query<GuardianLink[], string>({ query: studentId => `/students/records/guardian-access/students/${studentId}/links`, transformResponse: unwrap<GuardianLink[]>, providesTags: guardianTags }),
    getRecordGuardianReviews: builder.query<GuardianReview[], string>({ query: studentId => `/students/records/guardian-access/students/${studentId}/reviews`, transformResponse: unwrap<GuardianReview[]>, providesTags: guardianTags }),
    getRecordGuardianCandidate: builder.query<GuardianLink | null, { studentId: string; relationship: string }>({ query: ({ studentId, relationship }) => ({ url: `/students/records/guardian-access/students/${studentId}/candidate`, params: { relationship } }), transformResponse: unwrap<GuardianLink | null> }),
    resolveRecordGuardianReview: builder.mutation<GuardianReview, ResolveGuardianReview>({ query: ({ reviewId, ...body }) => ({ url: `/students/records/guardian-access/reviews/${reviewId}/resolve`, method: 'POST', body }), transformResponse: unwrap<GuardianReview>, invalidatesTags: (_result, error) => error ? [] : [...guardianTags, { type: studentType.student, id: 'RECORDS-CHANGES' }] }),
  }),
});
export const { useGetRecordCertificateTemplateQuery, useSaveRecordCertificateTemplateMutation, usePreviewRecordCertificateMutation, useIssueRecordCertificateMutation, useExportRecordIdsMutation, useGetRecordCertificateHistoryQuery, useGetRecordIdTemplateQuery, useSaveRecordIdTemplateMutation, useGetRecordIdTemplatesQuery, useCreateRecordIdTemplateMutation, useUpdateRecordIdTemplateMutation, useDeleteRecordIdTemplateMutation, usePreviewRecordIdsMutation, useIssueRecordIdsMutation, useGetRecordIdHistoryQuery, useDownloadRecordDocumentMutation, useReprintRecordDocumentMutation, useVoidRecordDocumentMutation, useDuplicateRecordCertificateMutation, useGetRecordGuardianLinksQuery, useGetRecordGuardianReviewsQuery, useGetRecordGuardianCandidateQuery, useResolveRecordGuardianReviewMutation } = studentRecordDocumentsApi;

export const { useGetRecordCertificateBatchesQuery, useGetRecordCertificateBatchQuery } = studentRecordDocumentsApi;

export function downloadRecordPdf(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = fileName; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
