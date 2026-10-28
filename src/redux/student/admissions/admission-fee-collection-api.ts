import type { CollectFeeOutput, FeeCollectFormDto } from 'src/redux/feeCollection/feeCollection';

import { financeModuleApi } from 'src/redux/finance/financeModuleApi';
import {
  receiptType,
  financeModuleType,
  studentOnboardingType,
  studentAdmissionsCrmType,
} from 'src/redux/tagTypes';

import { admissionFeeCollectionUrl } from './admission-fee-collection-types';
import { unwrapAdmissionFeeSelection } from './admission-fee-selection-types';

import type {
  CollectAdmissionFeeInput,
  AdmissionVariableFeeHead,
  AdmissionFeeCollectionSummary,
} from './admission-fee-collection-types';

const collectionTags = (applicationId: string) => [
  { type: financeModuleType.feeCollection, id: applicationId },
  { type: financeModuleType.feeDetails, id: applicationId },
];

const changedTags = (applicationId: string) => [
  ...collectionTags(applicationId),
  financeModuleType.feeCollection,
  financeModuleType.feeDetails,
  financeModuleType.charges,
  receiptType.receipt,
  financeModuleType.financeAudit,
  financeModuleType.incomeTracking,
  financeModuleType.cashManagement,
  financeModuleType.accountPosting,
  financeModuleType.draftPosting,
  { type: studentAdmissionsCrmType.admissionApplication, id: applicationId },
  studentOnboardingType.onboardingCaseDetail,
  studentOnboardingType.onboardingCaseList,
  studentOnboardingType.onboardingAnalytics,
];

export const admissionFeeCollectionApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionFeeCollectionSummary: builder.query<AdmissionFeeCollectionSummary, string>({
      query: (applicationId) => ({
        url: `${admissionFeeCollectionUrl(applicationId)}/summary`,
        timeout: 30_000,
      }),
      transformResponse: unwrapAdmissionFeeSelection<AdmissionFeeCollectionSummary>,
      providesTags: (_, __, applicationId) => collectionTags(applicationId),
    }),
    prepareAdmissionFeeCollection: builder.mutation<
      AdmissionFeeCollectionSummary,
      {
        applicationId: string;
        variableFeeHeads: AdmissionVariableFeeHead[];
      }
    >({
      query: ({ applicationId, variableFeeHeads }) => ({
        url: `${admissionFeeCollectionUrl(applicationId)}/prepare`,
        method: 'POST',
        body: { variableFeeHeads },
        timeout: 60_000,
      }),
      transformResponse: unwrapAdmissionFeeSelection<AdmissionFeeCollectionSummary>,
      invalidatesTags: (_, error, { applicationId }) => (error ? [] : changedTags(applicationId)),
    }),
    getAdmissionFeeCollectForm: builder.query<FeeCollectFormDto, string>({
      query: (applicationId) => ({
        url: `${admissionFeeCollectionUrl(applicationId)}/collect-form`,
        timeout: 30_000,
      }),
      transformResponse: unwrapAdmissionFeeSelection<FeeCollectFormDto>,
      providesTags: (_, __, applicationId) => collectionTags(applicationId),
    }),
    collectAdmissionFee: builder.mutation<
      CollectFeeOutput,
      { applicationId: string; input: CollectAdmissionFeeInput }
    >({
      query: ({ applicationId, input }) => ({
        url: admissionFeeCollectionUrl(applicationId),
        method: 'POST',
        body: input,
        timeout: 60_000,
      }),
      transformResponse: unwrapAdmissionFeeSelection<CollectFeeOutput>,
      invalidatesTags: (_, error, { applicationId }) => (error ? [] : changedTags(applicationId)),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdmissionFeeCollectionSummaryQuery,
  usePrepareAdmissionFeeCollectionMutation,
  useGetAdmissionFeeCollectFormQuery,
  useCollectAdmissionFeeMutation,
} = admissionFeeCollectionApi;
