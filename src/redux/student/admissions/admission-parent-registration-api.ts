import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { getAuthSessionCacheRevision } from 'src/redux/session-cache';

import type {
  ParentRegistrationCommand,
  ParentRegistrationSendInput,
  ParentRegistrationEmailInput,
  StaffParentRegistrationContext,
  ParentRegistrationEmailHistory,
  ParentRegistrationCopyLinkInput,
  ParentRegistrationReactivateInput,
  ParentRegistrationCorrectionInput,
} from './admission-parent-registration-types';

const base = (id: string) =>
  `/student/enrollment/admissions/applications/${encodeURIComponent(id)}/parent-registration`;
const unwrap = (
  result: StaffParentRegistrationContext | { data: StaffParentRegistrationContext }
) => ('data' in result ? result.data : result);
const unwrapEmailHistory = (
  result: ParentRegistrationEmailHistory[] | { data: ParentRegistrationEmailHistory[] }
) => ('data' in result ? result.data : result);
const invalidates = (_result: unknown, error: unknown) =>
  error ? [] : [studentAdmissionsCrmType.admissionApplication];
type Command<T = ParentRegistrationCommand> = { applicationId: string; input: T };

export const admissionParentRegistrationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getParentRegistration: builder.query<StaffParentRegistrationContext, string>({
      query: (id) => ({ url: base(id) }),
      transformResponse: unwrap,
      providesTags: (result) =>
        result
          ? [
              {
                type: studentAdmissionsCrmType.admissionApplication,
                id: `PARENT-${result.applicationId}`,
              },
            ]
          : [],
    }),
    getParentRegistrationEmailHistory: builder.query<ParentRegistrationEmailHistory[], string>({
      query: (id) => ({ url: `${base(id)}/email-history` }),
      transformResponse: unwrapEmailHistory,
      providesTags: (_result, _error, applicationId) => [
        { type: studentAdmissionsCrmType.admissionApplication, id: `PARENT-${applicationId}` },
      ],
    }),
    sendParentRegistration: builder.mutation<
      StaffParentRegistrationContext,
      Command<ParentRegistrationSendInput>
    >({
      query: ({ applicationId, input }) => ({
        url: `${base(applicationId)}/send`,
        method: 'POST',
        body: input,
      }),
      transformResponse: unwrap,
      invalidatesTags: invalidates,
    }),
    copyParentRegistrationLink: builder.mutation<
      { copied: boolean },
      Command<ParentRegistrationCopyLinkInput>
    >({
      async queryFn({ applicationId, input }, { signal }, _options, baseQuery) {
        const revision = getAuthSessionCacheRevision();
        const result = await baseQuery({
          url: `${base(applicationId)}/copy-link`,
          method: 'POST',
          body: input,
          cache: 'no-store',
        });
        if (result.error) return { error: result.error };
        const response = result.data as { data?: unknown } | string | null;
        const link = typeof response === 'string' ? response : response?.data;
        if (
          typeof link !== 'string' ||
          !/^https?:\/\/[^\s]+\/admission-registration#token=[\da-f]{64}$/i.test(link)
        ) {
          return {
            error: { status: 'CUSTOM_ERROR', error: 'The registration link is unavailable.' },
          };
        }
        if (signal.aborted || revision !== getAuthSessionCacheRevision())
          return { data: { copied: false } };
        // Keep the private URL out of Redux and the staff status/history responses.
        try {
          await navigator.clipboard.writeText(link);
          return { data: { copied: true } };
        } catch {
          return { data: { copied: false } };
        }
      },
      invalidatesTags: (result, error, { input }) =>
        result && input.recipientRelationship ? invalidates(result, error) : [],
    }),
    reactivateParentRegistration: builder.mutation<
      StaffParentRegistrationContext,
      Command<ParentRegistrationReactivateInput>
    >({
      query: ({ applicationId, input }) => ({
        url: `${base(applicationId)}/reactivate`,
        method: 'POST',
        body: input,
      }),
      transformResponse: unwrap,
      invalidatesTags: invalidates,
    }),
    changeParentRegistrationEmail: builder.mutation<
      StaffParentRegistrationContext,
      Command<ParentRegistrationEmailInput>
    >({
      query: ({ applicationId, input }) => ({
        url: `${base(applicationId)}/email`,
        method: 'POST',
        body: input,
      }),
      transformResponse: unwrap,
      invalidatesTags: invalidates,
    }),
    revokeParentRegistration: builder.mutation<StaffParentRegistrationContext, Command>({
      query: ({ applicationId, input }) => ({
        url: `${base(applicationId)}/revoke`,
        method: 'POST',
        body: input,
      }),
      transformResponse: unwrap,
      invalidatesTags: invalidates,
    }),
    takeoverParentRegistration: builder.mutation<StaffParentRegistrationContext, Command>({
      query: ({ applicationId, input }) => ({
        url: `${base(applicationId)}/takeover`,
        method: 'POST',
        body: input,
      }),
      transformResponse: unwrap,
      invalidatesTags: invalidates,
    }),
    requestParentRegistrationCorrections: builder.mutation<
      StaffParentRegistrationContext,
      Command<ParentRegistrationCorrectionInput>
    >({
      query: ({ applicationId, input }) => ({
        url: `${base(applicationId)}/corrections`,
        method: 'POST',
        body: input,
      }),
      transformResponse: unwrap,
      invalidatesTags: invalidates,
    }),
    applyParentRegistration: builder.mutation<
      StaffParentRegistrationContext,
      Command<ParentRegistrationCommand & { reason: string }>
    >({
      query: ({ applicationId, input }) => ({
        url: `${base(applicationId)}/apply`,
        method: 'POST',
        body: input,
      }),
      transformResponse: unwrap,
      invalidatesTags: invalidates,
    }),
    retryParentRegistrationDelivery: builder.mutation<StaffParentRegistrationContext, Command>({
      query: ({ applicationId, input }) => ({
        url: `${base(applicationId)}/retry-delivery`,
        method: 'POST',
        body: input,
      }),
      transformResponse: unwrap,
      invalidatesTags: invalidates,
    }),
  }),
});

export const {
  useGetParentRegistrationQuery,
  useGetParentRegistrationEmailHistoryQuery,
  useSendParentRegistrationMutation,
  useCopyParentRegistrationLinkMutation,
  useReactivateParentRegistrationMutation,
  useChangeParentRegistrationEmailMutation,
  useRevokeParentRegistrationMutation,
  useTakeoverParentRegistrationMutation,
  useRequestParentRegistrationCorrectionsMutation,
  useApplyParentRegistrationMutation,
  useRetryParentRegistrationDeliveryMutation,
} = admissionParentRegistrationApi;
