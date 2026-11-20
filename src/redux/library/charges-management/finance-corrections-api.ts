import { financeModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';
import { FinanceWaiverAction } from './finance-corrections.types';
import { financeSourceTag, financeExternalChanged } from './finance-external-tags';

import type { FinanceExternalSource } from './finance-external.types';
import type {
  FinanceWaiverContext,
  FinanceWaiverContextInput,
  FinanceExternalRefundForm,
  FinanceExternalRefundCommand,
  FinanceExternalRefundPreview,
  FinanceExternalRefundRequest,
  FinanceExternalRefundSelection,
} from './finance-corrections.types';

const root = '/finance/external-receivables';
const routes = {
  [FinanceWaiverAction.Apply]: 'waiver-apply-context',
  [FinanceWaiverAction.Approve]: 'waiver-approval-context',
  [FinanceWaiverAction.Reject]: 'waiver-rejection-context',
  [FinanceWaiverAction.Reverse]: 'waiver-reversal-context',
};
const sourceParams = ({ kind, sourceId, sourceVersion }: FinanceExternalSource) => ({
  kind,
  sourceId,
  sourceVersion,
});

export const libraryFinanceCorrectionsApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceExternalWaiverContext: builder.query<FinanceWaiverContext, FinanceWaiverContextInput>(
      {
        query: ({ source, action, ...paging }) => {
          if (!(action in routes)) throw new Error('Choose a supported waiver action.');
          return {
            url: `${root}/operator/${routes[action]}`,
            params: { ...sourceParams(source), ...paging },
          };
        },
        providesTags: (_result, _error, { source }) => [financeSourceTag(source)],
      }
    ),
    getFinanceExternalRefundForm: builder.query<FinanceExternalRefundForm, FinanceExternalSource>({
      query: (source) => ({ url: `${root}/refund-form`, params: sourceParams(source) }),
      providesTags: (_result, _error, source) => [
        financeSourceTag(source),
        financeModuleType.feeRefund,
      ],
    }),
    previewFinanceExternalRefund: builder.mutation<
      FinanceExternalRefundPreview,
      FinanceExternalRefundSelection
    >({
      query: (body) => ({ url: `${root}/refunds/preview`, method: 'POST', body }),
    }),
    createFinanceExternalRefund: builder.mutation<
      FinanceExternalRefundRequest,
      FinanceExternalRefundCommand
    >({
      query: (body) => ({ url: `${root}/refunds`, method: 'POST', body }),
      invalidatesTags: financeExternalChanged,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFinanceExternalWaiverContextQuery,
  useLazyGetFinanceExternalWaiverContextQuery,
  useGetFinanceExternalRefundFormQuery,
  useLazyGetFinanceExternalRefundFormQuery,
  usePreviewFinanceExternalRefundMutation,
  useCreateFinanceExternalRefundMutation,
} = libraryFinanceCorrectionsApi;
