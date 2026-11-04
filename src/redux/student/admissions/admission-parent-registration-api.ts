import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import type {
  ParentRegistrationCommand,
  ParentRegistrationSendInput,
  ParentRegistrationEmailInput,
  StaffParentRegistrationContext,
  ParentRegistrationCorrectionInput,
} from './admission-parent-registration-types';

const base = (id: string) =>
  `/student/enrollment/admissions/applications/${encodeURIComponent(id)}/parent-registration`;
const unwrap = (
  result: StaffParentRegistrationContext | { data: StaffParentRegistrationContext }
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
  useSendParentRegistrationMutation,
  useChangeParentRegistrationEmailMutation,
  useRevokeParentRegistrationMutation,
  useTakeoverParentRegistrationMutation,
  useRequestParentRegistrationCorrectionsMutation,
  useApplyParentRegistrationMutation,
  useRetryParentRegistrationDeliveryMutation,
} = admissionParentRegistrationApi;
