import { api } from 'src/redux/service';
import {
  financeModuleType,
  studentAdmissionType,
  studentOnboardingType,
  studentAdmissionsCrmType,
} from 'src/redux/tagTypes';

import {
  admissionFeeSelectionUrl,
  unwrapAdmissionFeeSelection,
} from './admission-fee-selection-types';

import type {
  AdmissionFeeSelection,
  AdmissionFeeSelectionCommand,
  AdmissionFeeStructureCandidate,
} from './admission-fee-selection-types';

const applicationTags = [
  studentAdmissionsCrmType.admissionApplication,
  studentAdmissionsCrmType.admissionApplicant,
];

export const admissionFeeSelectionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionFeeSelection: builder.query<AdmissionFeeSelection, string>({
      query: admissionFeeSelectionUrl,
      transformResponse: unwrapAdmissionFeeSelection<AdmissionFeeSelection>,
      providesTags: (_, __, applicationId) => [
        { type: studentAdmissionsCrmType.admissionApplication, id: applicationId },
        studentAdmissionType.studentAdmission,
        financeModuleType.feeCollection,
      ],
    }),
    getAdmissionFeeSelectionCandidates: builder.query<AdmissionFeeStructureCandidate[], string>({
      query: (applicationId) => `${admissionFeeSelectionUrl(applicationId)}/candidates`,
      transformResponse: unwrapAdmissionFeeSelection<AdmissionFeeStructureCandidate[]>,
      providesTags: [financeModuleType.feeStructure],
    }),
    saveAdmissionFeeSelection: builder.mutation<
      AdmissionFeeSelection,
      AdmissionFeeSelectionCommand & {
        structureId: string;
        optionalHeadIds: string[];
      }
    >({
      query: ({ applicationId, ...body }) => ({
        url: admissionFeeSelectionUrl(applicationId),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapAdmissionFeeSelection<AdmissionFeeSelection>,
      invalidatesTags: applicationTags,
    }),
    confirmAdmissionFeeSelectionOnboarding: builder.mutation<
      AdmissionFeeSelection,
      AdmissionFeeSelectionCommand
    >({
      query: ({ applicationId, ...body }) => ({
        url: `${admissionFeeSelectionUrl(applicationId)}/confirm-onboarding`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapAdmissionFeeSelection<AdmissionFeeSelection>,
      invalidatesTags: [
        ...applicationTags,
        studentOnboardingType.onboardingCaseDetail,
        studentOnboardingType.onboardingCaseList,
        studentOnboardingType.onboardingAnalytics,
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdmissionFeeSelectionQuery,
  useGetAdmissionFeeSelectionCandidatesQuery,
  useSaveAdmissionFeeSelectionMutation,
  useConfirmAdmissionFeeSelectionOnboardingMutation,
} = admissionFeeSelectionApi;
