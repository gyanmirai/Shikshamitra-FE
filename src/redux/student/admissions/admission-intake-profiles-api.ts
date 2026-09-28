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

type Envelope<T> = T | { data: T };
const unwrap = <T>(response: Envelope<T>): T =>
  typeof response === 'object' && response !== null && 'data' in response
    ? response.data
    : (response as T);

const tag = studentAdmissionsCrmType.admissionOffering;

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
      transformResponse: (response: Envelope<CreatedAdmissionPublicInquiryLink>) => unwrap(response),
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
  useGetAdmissionPublicInquiryLinksQuery,
  useCreateAdmissionPublicInquiryLinkMutation,
  useSetAdmissionPublicInquiryLinkFormMutation,
  useRevokeAdmissionPublicInquiryLinkMutation,
} = admissionIntakeProfilesApi;
