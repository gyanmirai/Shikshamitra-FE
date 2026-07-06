import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export const accountPostingApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getPostings: builder.query({
      query: (params) => ({
        url: '/account-postings',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.accountPosting],
    }),

    getPostingsByHead: builder.query({
      query: (headId: string) => ({
        url: `/account-postings/by-head/${headId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.accountPosting],
    }),

    getDraftPostings: builder.query({
      query: (params) => ({
        url: '/account-postings/drafts',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.draftPosting],
    }),

    createPosting: builder.mutation({
      query: (body) => ({
        url: '/account-postings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.accountPosting, financeModuleType.accountHead],
    }),

    finalisePosting: builder.mutation({
      query: (id: string) => ({
        url: `/account-postings/${id}/finalise`,
        method: 'PATCH',
      }),
      invalidatesTags: [
        financeModuleType.accountPosting,
        financeModuleType.accountHead,
        financeModuleType.draftPosting,
      ],
    }),

    reversePosting: builder.mutation({
      query: (id: string) => ({
        url: `/account-postings/${id}/reverse`,
        method: 'POST',
      }),
      invalidatesTags: [financeModuleType.accountPosting, financeModuleType.accountHead],
    }),

    bulkFinalise: builder.mutation({
      query: (body) => ({
        url: '/account-postings/bulk-finalise',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.accountPosting,
        financeModuleType.accountHead,
        financeModuleType.draftPosting,
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostingsQuery,
  useGetPostingsByHeadQuery,
  useGetDraftPostingsQuery,
  useCreatePostingMutation,
  useFinalisePostingMutation,
  useReversePostingMutation,
  useBulkFinaliseMutation,
} = accountPostingApi;
