import { api } from '../service';
import { communicationType } from '../tagTypes';

import type {
  PagedResultDto,
  UsageLedgerEntryDto,
  CommunicationReplyDto,
  CommunicationDashboardDto,
} from './communicationTypes';

export const communicationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCommunicationDashboard: builder.query<CommunicationDashboardDto, void>({
      query: () => ({
        url: '/communication/dashboard',
        method: 'GET',
      }),
      providesTags: [communicationType.communicationDashboard],
    }),
    getCommunicationReplies: builder.query<PagedResultDto<CommunicationReplyDto>, any | void>({
      query: (params) => ({
        url: '/communication/replies',
        method: 'GET',
        params,
      }),
      providesTags: [communicationType.communicationReplies],
    }),
    assignCommunicationReply: builder.mutation<
      CommunicationReplyDto,
      {
        id: string;
        data: {
          assignedToUserId?: string | null;
          assignedDepartment?: string | null;
          status: number;
          internalNotes?: string | null;
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/communication/replies/${id}/assign`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [communicationType.communicationReplies],
    }),
    getCommunicationUsageLedger: builder.query<PagedResultDto<UsageLedgerEntryDto>, any | void>({
      query: (params) => ({
        url: '/communication/usage-ledger',
        method: 'GET',
        params,
      }),
      providesTags: [communicationType.communicationUsageLedger],
    }),
    getCommunicationApprovalRules: builder.query<PagedResultDto<any>, any | void>({
      query: (params) => ({
        url: '/communication/approval-rules',
        method: 'GET',
        params,
      }),
      providesTags: [communicationType.communicationApprovalRules],
    }),
  }),
});

export const {
  useGetCommunicationDashboardQuery,
  useGetCommunicationRepliesQuery,
  useAssignCommunicationReplyMutation,
  useGetCommunicationUsageLedgerQuery,
  useGetCommunicationApprovalRulesQuery,
} = communicationApi;
