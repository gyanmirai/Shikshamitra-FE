import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionIntakeProfileKind = 0 | 1;

export type AdmissionInquiryIntakeRules = {
  version: 1;
  duplicateRule: 0 | 1 | 2;
  applicationStartRequirement: 0 | 1 | 2;
  firstContactDueInHours: number | null;
  qualificationDueInDays: number | null;
  followUpDueInDays: number;
  maxOpenFollowUps: number;
  requireGuardianEmail: boolean;
  requireApplicantDateOfBirth: boolean;
  allowedSources: number[];
  requireSourceDetailFor: number[];
};

export type AdmissionCounsellorAssignmentRules = {
  version: 1;
  counsellorUserIds: string[];
  maxActiveCasesPerCounsellor: number;
  fallbackManagerUserId: string | null;
};

export type AdmissionIntakeProfile = {
  id: string;
  kind: AdmissionIntakeProfileKind;
  code: string;
  name: string;
  configurationJson: string;
  concurrencyStamp: string;
};

export type IntakeCounsellorChoice = { id: string; name: string; userName: string };

export type SaveAdmissionIntakeProfileInput = Omit<AdmissionIntakeProfile, 'id'>;

export type AdmissionIntakeSetupInquiryRules = Omit<AdmissionInquiryIntakeRules, 'version'>;
export type AdmissionIntakeSetupAssignmentRules = Omit<
  AdmissionCounsellorAssignmentRules,
  'version' | 'fallbackManagerUserId'
> & { fallbackManagerUserId: string };

export type AdmissionIntakeSetupOfferingUsage = {
  id: string;
  name: string;
  code: string;
  admissionCycleId: string;
  entryMode: 0 | 1 | 2;
  isActive: boolean;
};

export type AdmissionIntakeSetupPublicLinkUsage = {
  id: string;
  name: string;
  admissionCycleId: string;
  expiresAtUtc?: string | null;
  isActive: boolean;
  isOperational: boolean;
};

export type AdmissionIntakeSetupUsage = {
  setupId: string;
  offerings: AdmissionIntakeSetupOfferingUsage[];
  publicInquiryLinks: AdmissionIntakeSetupPublicLinkUsage[];
  activeOfferingCount: number;
  activePublicInquiryLinkCount: number;
  hasActiveUsage: boolean;
};

export type AdmissionIntakeSetup = {
  id: string;
  name: string;
  inquiryIntakeProfileId: string;
  counsellorAssignmentProfileId: string;
  inquiryRules: AdmissionIntakeSetupInquiryRules;
  counsellorAssignmentRules: AdmissionIntakeSetupAssignmentRules;
  isArchived: boolean;
  archivedTime?: string | null;
  concurrencyStamp: string;
  activeOfferingCount: number;
  activePublicInquiryLinkCount: number;
  isConfigurationValid: boolean;
  configurationIssue?: string | null;
};

export type SaveAdmissionIntakeSetupInput = {
  name: string;
  inquiryRules: AdmissionIntakeSetupInquiryRules;
  counsellorAssignmentRules: AdmissionIntakeSetupAssignmentRules;
  concurrencyStamp?: string;
};

export type AdmissionPublicInquiryLink = {
  id: string;
  admissionCycleId: string;
  counsellorAssignmentProfileId: string;
  inquiryFormDefinitionId?: string | null;
  name: string;
  source: number;
  sourceDetail?: string | null;
  expiresAtUtc?: string | null;
  isActive: boolean;
  concurrencyStamp: string;
};

export type CreateAdmissionPublicInquiryLink = Omit<
  AdmissionPublicInquiryLink,
  'id' | 'isActive' | 'concurrencyStamp'
>;

export type CreatedAdmissionPublicInquiryLink = AdmissionPublicInquiryLink & { token: string };

export type AdmissionPublicInquiryLinkOption = {
  counsellorAssignmentProfileId: string;
  inquiryFormDefinitionId: string;
};

type Envelope<T> = T | { data: T };
const unwrap = <T>(response: Envelope<T>): T =>
  typeof response === 'object' && response !== null && 'data' in response
    ? response.data
    : (response as T);

const tag = studentAdmissionsCrmType.admissionOffering;
const setupBaseUrl = '/student/enrollment/admissions/intake-setups';

export const admissionIntakeProfilesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionIntakeCounsellors: builder.query<IntakeCounsellorChoice[], void>({
      query: () => '/student/enrollment/admissions/intake-profiles/counsellors',
      transformResponse: (response: Envelope<IntakeCounsellorChoice[]>) => unwrap(response),
      providesTags: [tag],
    }),
    getAdmissionIntakeProfiles: builder.query<AdmissionIntakeProfile[], void>({
      query: () => '/student/enrollment/admissions/intake-profiles',
      transformResponse: (response: Envelope<AdmissionIntakeProfile[]>) => unwrap(response),
      providesTags: [tag],
    }),
    createAdmissionIntakeProfile: builder.mutation<
      AdmissionIntakeProfile,
      SaveAdmissionIntakeProfileInput
    >({
      query: (body) => ({
        url: '/student/enrollment/admissions/intake-profiles',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Envelope<AdmissionIntakeProfile>) => unwrap(response),
      invalidatesTags: [tag],
    }),
    updateAdmissionIntakeProfile: builder.mutation<
      AdmissionIntakeProfile,
      { id: string; body: SaveAdmissionIntakeProfileInput }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/intake-profiles/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Envelope<AdmissionIntakeProfile>) => unwrap(response),
      invalidatesTags: [tag],
    }),
    getAdmissionIntakeSetups: builder.query<
      AdmissionIntakeSetup[],
      { includeArchived?: boolean } | void
    >({
      query: (params) => ({
        url: setupBaseUrl,
        method: 'GET',
        params: params?.includeArchived ? { includeArchived: true } : undefined,
      }),
      transformResponse: (response: Envelope<AdmissionIntakeSetup[]>) => unwrap(response),
      providesTags: [tag],
    }),
    createAdmissionIntakeSetup: builder.mutation<
      AdmissionIntakeSetup,
      SaveAdmissionIntakeSetupInput
    >({
      query: (body) => ({ url: setupBaseUrl, method: 'POST', body }),
      transformResponse: (response: Envelope<AdmissionIntakeSetup>) => unwrap(response),
      invalidatesTags: [tag],
    }),
    updateAdmissionIntakeSetup: builder.mutation<
      AdmissionIntakeSetup,
      { id: string; body: SaveAdmissionIntakeSetupInput }
    >({
      query: ({ id, body }) => ({ url: `${setupBaseUrl}/${id}`, method: 'PUT', body }),
      transformResponse: (response: Envelope<AdmissionIntakeSetup>) => unwrap(response),
      invalidatesTags: [tag],
    }),
    getAdmissionIntakeSetupUsage: builder.query<AdmissionIntakeSetupUsage, string>({
      query: (id) => `${setupBaseUrl}/${id}/usage`,
      transformResponse: (response: Envelope<AdmissionIntakeSetupUsage>) => unwrap(response),
      providesTags: [tag],
    }),
    archiveAdmissionIntakeSetup: builder.mutation<
      AdmissionIntakeSetup,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `${setupBaseUrl}/${id}/archive`,
        method: 'POST',
        body: { concurrencyStamp },
      }),
      transformResponse: (response: Envelope<AdmissionIntakeSetup>) => unwrap(response),
      invalidatesTags: [tag],
    }),
    getAdmissionPublicInquiryLinkOptions: builder.query<AdmissionPublicInquiryLinkOption[], string>(
      {
        query: (admissionCycleId) => ({
          url: '/student/enrollment/admissions/public-inquiry-links/options',
          params: { admissionCycleId },
        }),
        transformResponse: (response: Envelope<AdmissionPublicInquiryLinkOption[]>) =>
          unwrap(response),
        providesTags: [
          tag,
          studentAdmissionsCrmType.admissionForm,
          studentAdmissionsCrmType.admissionCycle,
        ],
      }
    ),
    getAdmissionPublicInquiryLinks: builder.query<AdmissionPublicInquiryLink[], void>({
      query: () => '/student/enrollment/admissions/public-inquiry-links',
      transformResponse: (response: Envelope<AdmissionPublicInquiryLink[]>) => unwrap(response),
      providesTags: [tag],
    }),
    createAdmissionPublicInquiryLink: builder.mutation<
      CreatedAdmissionPublicInquiryLink,
      CreateAdmissionPublicInquiryLink
    >({
      query: (body) => ({
        url: '/student/enrollment/admissions/public-inquiry-links',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Envelope<CreatedAdmissionPublicInquiryLink>) =>
        unwrap(response),
      invalidatesTags: [tag],
    }),
    setAdmissionPublicInquiryLinkForm: builder.mutation<
      AdmissionPublicInquiryLink,
      { id: string; inquiryFormDefinitionId: string; concurrencyStamp: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/enrollment/admissions/public-inquiry-links/${id}/form`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Envelope<AdmissionPublicInquiryLink>) => unwrap(response),
      invalidatesTags: [tag],
    }),
    revokeAdmissionPublicInquiryLink: builder.mutation<
      void,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/enrollment/admissions/public-inquiry-links/${id}/revoke`,
        method: 'POST',
        body: { concurrencyStamp },
      }),
      invalidatesTags: [tag],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdmissionIntakeCounsellorsQuery,
  useGetAdmissionIntakeProfilesQuery,
  useCreateAdmissionIntakeProfileMutation,
  useUpdateAdmissionIntakeProfileMutation,
  useGetAdmissionIntakeSetupsQuery,
  useCreateAdmissionIntakeSetupMutation,
  useUpdateAdmissionIntakeSetupMutation,
  useGetAdmissionIntakeSetupUsageQuery,
  useLazyGetAdmissionIntakeSetupUsageQuery,
  useArchiveAdmissionIntakeSetupMutation,
  useGetAdmissionPublicInquiryLinksQuery,
  useGetAdmissionPublicInquiryLinkOptionsQuery,
  useCreateAdmissionPublicInquiryLinkMutation,
  useSetAdmissionPublicInquiryLinkFormMutation,
  useRevokeAdmissionPublicInquiryLinkMutation,
} = admissionIntakeProfilesApi;
