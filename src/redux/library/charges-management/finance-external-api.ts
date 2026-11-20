import { libraryFinanceCorrectionsApi } from './finance-corrections-api';
import {
  financeSourceTag as sourceTag,
  financeExternalChanged as changed,
} from './finance-external-tags';

import type {
  FinanceExternalSource,
  FinanceExternalWaiver,
  FinanceExternalCollection,
  FinanceExternalReceivable,
  FinanceExternalCollectionForm,
} from './finance-external.types';
import type {
  FinanceOperatorPage,
  FinanceOperatorOption,
  FinanceOperatorContext,
  FinanceOperatorHistory,
  FinanceOperatorOptionsInput,
  FinanceOperatorHistoryInput,
} from './finance-operator.types';
import type {
  BindFinanceExternalPolicy,
  DecideFinanceExternalWaiver,
  RequestFinanceExternalWaiver,
  ReverseFinanceExternalWaiver,
  PostFinanceExternalReceivable,
  ApproveFinanceExternalReceivable,
  CollectFinanceExternalReceivable,
} from './finance-external.commands';

export {
  useGetFinanceExternalRefundFormQuery,
  useCreateFinanceExternalRefundMutation,
  useGetFinanceExternalWaiverContextQuery,
  usePreviewFinanceExternalRefundMutation,
  useLazyGetFinanceExternalRefundFormQuery,
  useLazyGetFinanceExternalWaiverContextQuery,
} from './finance-corrections-api';

const root = '/finance/external-receivables';
export const libraryFinanceApi = libraryFinanceCorrectionsApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceExternalPostingOptions: builder.query<
      FinanceOperatorPage<FinanceOperatorOption>,
      FinanceOperatorOptionsInput
    >({
      query: ({ source, ...options }) => ({
        url: `${root}/operator/posting-options`,
        params: { ...source, ...options },
      }),
      providesTags: (_result, _error, { source }) => [sourceTag(source)],
    }),
    getFinanceExternalBindingOptions: builder.query<
      FinanceOperatorPage<FinanceOperatorOption>,
      FinanceOperatorOptionsInput
    >({
      query: ({ source, ...options }) => ({
        url: `${root}/operator/binding-options`,
        params: { ...source, ...options },
      }),
      providesTags: (_result, _error, { source }) => [sourceTag(source)],
    }),
    getFinanceExternalBindingContext: builder.query<FinanceOperatorContext, FinanceExternalSource>({
      query: (source) => ({ url: `${root}/operator/binding-context`, params: source }),
      providesTags: (_result, _error, source) => [sourceTag(source)],
    }),
    getFinanceExternalApprovalContext: builder.query<FinanceOperatorContext, FinanceExternalSource>(
      {
        query: (source) => ({ url: `${root}/operator/approval-context`, params: source }),
        providesTags: (_result, _error, source) => [sourceTag(source)],
      }
    ),
    getFinanceExternalHistory: builder.query<
      FinanceOperatorPage<FinanceOperatorHistory>,
      FinanceOperatorHistoryInput
    >({
      query: ({ source, ...paging }) => ({
        url: `${root}/operator/history`,
        params: { ...source, ...paging },
      }),
      providesTags: (_result, _error, { source }) => [sourceTag(source)],
    }),
    postFinanceExternalReceivable: builder.mutation<
      FinanceExternalReceivable,
      PostFinanceExternalReceivable
    >({
      query: (body) => ({ url: root, method: 'POST', body }),
      invalidatesTags: changed,
    }),
    getFinanceExternalReceivable: builder.query<FinanceExternalReceivable, FinanceExternalSource>({
      query: ({ kind, sourceId, sourceVersion }) => ({
        url: root,
        params: { kind, sourceId, sourceVersion },
      }),
      providesTags: (_result, _error, source) => [sourceTag(source)],
    }),
    getFinanceExternalCollectForm: builder.query<
      FinanceExternalCollectionForm,
      FinanceExternalSource
    >({
      query: ({ kind, sourceId, sourceVersion }) => ({
        url: `${root}/collect-form`,
        params: { kind, sourceId, sourceVersion },
      }),
      providesTags: (_result, _error, source) => [sourceTag(source)],
    }),
    bindFinanceExternalPolicy: builder.mutation<
      FinanceExternalCollectionForm,
      BindFinanceExternalPolicy
    >({
      query: (body) => ({ url: `${root}/settlement-policy`, method: 'POST', body }),
      invalidatesTags: changed,
    }),
    approveFinanceExternalReceivable: builder.mutation<
      FinanceExternalReceivable,
      ApproveFinanceExternalReceivable
    >({
      query: (body) => ({ url: `${root}/approve`, method: 'POST', body }),
      invalidatesTags: changed,
    }),
    collectFinanceExternalReceivable: builder.mutation<
      FinanceExternalCollection,
      CollectFinanceExternalReceivable
    >({
      query: (body) => ({ url: `${root}/collections`, method: 'POST', body }),
      invalidatesTags: changed,
    }),
    requestFinanceExternalWaiver: builder.mutation<
      FinanceExternalWaiver,
      RequestFinanceExternalWaiver
    >({
      query: (body) => ({ url: `${root}/waivers`, method: 'POST', body }),
      invalidatesTags: changed,
    }),
    approveFinanceExternalWaiver: builder.mutation<
      FinanceExternalWaiver,
      DecideFinanceExternalWaiver
    >({
      query: (body) => ({ url: `${root}/waivers/approve`, method: 'POST', body }),
      invalidatesTags: changed,
    }),
    rejectFinanceExternalWaiver: builder.mutation<
      FinanceExternalWaiver,
      DecideFinanceExternalWaiver
    >({
      query: (body) => ({ url: `${root}/waivers/reject`, method: 'POST', body }),
      invalidatesTags: changed,
    }),
    reverseFinanceExternalWaiver: builder.mutation<
      FinanceExternalWaiver,
      ReverseFinanceExternalWaiver
    >({
      query: (body) => ({ url: `${root}/waivers/reverse`, method: 'POST', body }),
      invalidatesTags: changed,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFinanceExternalPostingOptionsQuery,
  useLazyGetFinanceExternalPostingOptionsQuery,
  useGetFinanceExternalBindingOptionsQuery,
  useLazyGetFinanceExternalBindingOptionsQuery,
  useGetFinanceExternalBindingContextQuery,
  useLazyGetFinanceExternalBindingContextQuery,
  useGetFinanceExternalApprovalContextQuery,
  useLazyGetFinanceExternalApprovalContextQuery,
  useGetFinanceExternalHistoryQuery,
  usePostFinanceExternalReceivableMutation,
  useGetFinanceExternalReceivableQuery,
  useLazyGetFinanceExternalReceivableQuery,
  useGetFinanceExternalCollectFormQuery,
  useLazyGetFinanceExternalCollectFormQuery,
  useBindFinanceExternalPolicyMutation,
  useApproveFinanceExternalReceivableMutation,
  useCollectFinanceExternalReceivableMutation,
  useRequestFinanceExternalWaiverMutation,
  useApproveFinanceExternalWaiverMutation,
  useRejectFinanceExternalWaiverMutation,
  useReverseFinanceExternalWaiverMutation,
} = libraryFinanceApi;
