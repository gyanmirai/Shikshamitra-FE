import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import type { AdmissionFormStagePolicy } from './admission-form-stage-policy';

export type AdmissionFormSectionVerification = {
  sectionId: string;
  sectionCode: string;
  sectionName: string;
  required: boolean;
  verified: boolean;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  reason?: string | null;
};
export type AdmissionFormStage = {
  applicationId: string;
  stageId: string;
  formStageEnabled: boolean;
  policy?: AdmissionFormStagePolicy | null;
  isActive: boolean;
  formStatus: 0 | 1 | 2;
  dueAt?: string | null;
  isOverdue: boolean;
  submissionAttempts: number;
  concurrencyStamp: string;
  canSaveDraft: boolean;
  canSubmit: boolean;
  canVerify: boolean;
  canRequestCorrection: boolean;
  canComplete: boolean;
  blockers: string[];
  sections: AdmissionFormSectionVerification[];
};

type Result<T> = { data?: T };
const unwrap = <T>(response: Result<T> | T): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data
    : (response as T);
const tag = (applicationId: string, stageId: string) => `${applicationId}:FORM:${stageId}`;

export const admissionFormStageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionFormStage: builder.query<
      AdmissionFormStage,
      { applicationId: string; stageId: string }
    >({
      query: ({ applicationId, stageId }) =>
        `/student/enrollment/admissions/applications/${applicationId}/form-stages/${stageId}`,
      transformResponse: (response: Result<AdmissionFormStage> | AdmissionFormStage) =>
        unwrap(response),
      providesTags: (_result, _error, input) => [
        {
          type: studentAdmissionsCrmType.admissionApplication,
          id: tag(input.applicationId, input.stageId),
        },
        { type: studentAdmissionsCrmType.admissionApplication, id: input.applicationId },
      ],
    }),
    verifyAdmissionFormSection: builder.mutation<
      AdmissionFormStage,
      {
        applicationId: string;
        stageId: string;
        sectionId: string;
        concurrencyStamp: string;
        verified: boolean;
        reason?: string;
      }
    >({
      query: ({ applicationId, stageId, sectionId, ...body }) => ({
        url: `/student/enrollment/admissions/applications/${applicationId}/form-stages/${stageId}/sections/${sectionId}/verification`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<AdmissionFormStage> | AdmissionFormStage) =>
        unwrap(response),
      invalidatesTags: (_result, _error, input) => [
        {
          type: studentAdmissionsCrmType.admissionApplication,
          id: tag(input.applicationId, input.stageId),
        },
        { type: studentAdmissionsCrmType.admissionApplication, id: input.applicationId },
      ],
    }),
    requestAdmissionFormCorrection: builder.mutation<
      AdmissionFormStage,
      { applicationId: string; stageId: string; concurrencyStamp: string; reason: string }
    >({
      query: ({ applicationId, stageId, ...body }) => ({
        url: `/student/enrollment/admissions/applications/${applicationId}/form-stages/${stageId}/correction`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<AdmissionFormStage> | AdmissionFormStage) =>
        unwrap(response),
      invalidatesTags: (_result, _error, input) => [
        {
          type: studentAdmissionsCrmType.admissionApplication,
          id: tag(input.applicationId, input.stageId),
        },
        { type: studentAdmissionsCrmType.admissionApplication, id: input.applicationId },
      ],
    }),
  }),
});

export const {
  useGetAdmissionFormStageQuery,
  useVerifyAdmissionFormSectionMutation,
  useRequestAdmissionFormCorrectionMutation,
} = admissionFormStageApi;
