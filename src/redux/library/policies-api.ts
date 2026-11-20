import { librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';

import type {
  LibraryPage,
  LibraryPolicyOptions,
  LibraryPolicyVersion,
  LibraryPolicySnapshot,
  LibraryPolicyDraftRequest,
  LibraryPolicyResolveRequest,
} from './policy-types';

type Year = { academicYearId: string };
const policyTags = [{ type: librarySettingsType.librarySettings, id: 'POLICIES' }];

export const libraryPoliciesApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryPolicies: builder.query<
      LibraryPage<LibraryPolicyVersion>,
      Year & { page: number; pageSize: number }
    >({
      query: (params) => ({ url: '/library/policies', params }),
      providesTags: policyTags,
    }),
    getLibraryPolicyOptions: builder.query<LibraryPolicyOptions, Year>({
      query: (params) => ({ url: '/library/policies/options', params }),
      providesTags: policyTags,
    }),
    getLibraryPolicy: builder.query<LibraryPolicyVersion, string>({
      query: (versionId) => ({ url: `/library/policies/${versionId}` }),
      providesTags: policyTags,
    }),
    createLibraryPolicy: builder.mutation<
      LibraryPolicyVersion,
      Year & { body: LibraryPolicyDraftRequest }
    >({
      query: ({ academicYearId, body }) => ({
        url: '/library/policies',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: policyTags,
    }),
    updateLibraryPolicy: builder.mutation<
      LibraryPolicyVersion,
      { versionId: string; body: LibraryPolicyDraftRequest }
    >({
      query: ({ versionId, body }) => ({
        url: `/library/policies/${versionId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    publishLibraryPolicy: builder.mutation<
      LibraryPolicyVersion,
      { versionId: string; concurrencyStamp?: string | null }
    >({
      query: ({ versionId, concurrencyStamp }) => ({
        url: `/library/policies/${versionId}/publish`,
        method: 'POST',
        body: { concurrencyStamp },
      }),
      invalidatesTags: policyTags,
    }),
    archiveLibraryPolicy: builder.mutation<
      LibraryPolicyVersion,
      { versionId: string; concurrencyStamp?: string | null; effectiveOn: string; reason: string }
    >({
      query: ({ versionId, ...body }) => ({
        url: `/library/policies/${versionId}/archive`,
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    resolveLibraryPolicy: builder.mutation<LibraryPolicySnapshot, LibraryPolicyResolveRequest>({
      query: (body) => ({ url: '/library/policies/resolve', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLibraryPoliciesQuery,
  useGetLibraryPolicyOptionsQuery,
  useGetLibraryPolicyQuery,
  useCreateLibraryPolicyMutation,
  useUpdateLibraryPolicyMutation,
  usePublishLibraryPolicyMutation,
  useArchiveLibraryPolicyMutation,
  useResolveLibraryPolicyMutation,
} = libraryPoliciesApi;
