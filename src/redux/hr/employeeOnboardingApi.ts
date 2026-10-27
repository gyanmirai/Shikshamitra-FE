import type { ReligionType } from 'src/enums/religion';
import type { EmployeeApplicationStatus } from 'src/screens/hr/employee-onboarding/status';

import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

export type EmployeeApplicationLocation = {
  name: string;
  isoCode: string;
};

export type EmployeeApplicationWorkExperience = {
  mediumStageName?: string;
  designation?: string;
  department?: string;
  country?: EmployeeApplicationLocation | null;
  state?: EmployeeApplicationLocation | null;
  city?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type EmployeeApplicationFamilyMember = {
  name?: string | null;
  occupation?: string | null;
  mobileNo?: string | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  country?: EmployeeApplicationLocation | null;
  state?: EmployeeApplicationLocation | null;
  city?: string | null;
  pincode?: string | null;
};

export type EmployeeApplicationFamilyInfo = {
  fatherDetails?: EmployeeApplicationFamilyMember | null;
  motherDetails?: EmployeeApplicationFamilyMember | null;
  spouseDetails?: EmployeeApplicationFamilyMember | null;
};

export type EmployeeApplicationAdditionalInfo = {
  personWithDisability?: boolean;
  secondLanguage?: string | null;
  isLibraryMember?: boolean;
  isTransportMember?: boolean;
};

export type EmployeeApplicationPersonalInfo = {
  firstName: string;
  middleName?: string | null;
  shortName?: string | null;
  lastName: string;
  email: string;
  mobileNo: string;
  secondaryMobileNo?: string | null;
  dateOfBirth?: string | null;
  gender?: number | null;
  religion?: ReligionType;
  casteType?: number | null;
  familyCaste?: string | null;
  maritalStatus?: number | null;
  bloodGroup?: number | null;
  isTeaching?: boolean;
  department?: string | null;
  designation?: string | null;
  qualification?: string | null;
  identificationMark1?: string | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  country?: EmployeeApplicationLocation | null;
  state?: EmployeeApplicationLocation | null;
  city?: string | null;
  pincode?: string | null;
};

export type EmployeeApplication = {
  id: string;
  applicationNumber: string;
  status: EmployeeApplicationStatus | string | number;
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  publicPath?: string | null;
  email?: string;
  mobileNo?: string;
  secondaryMobileNo?: string;
  positionAppliedFor?: string;
  departmentAppliedFor?: string;
  workAssignment?:
    import('src/screens/hr/employee-onboarding/work-assignment').EmployeeWorkAssignment | null;
  workAssignmentDisplay?: string;
  dateOfBirth?: string | null;
  gender?: number | null;
  religion?: string | null;
  casteType?: number | null;
  familyCaste?: string | null;
  maritalStatus?: number | null;
  bloodGroup?: number | null;
  qualificationSummary?: string | null;
  skillsSummary?: string | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  country?: EmployeeApplicationLocation | null;
  state?: EmployeeApplicationLocation | null;
  city?: string | null;
  pinCode?: string | null;
  personalInfo?: EmployeeApplicationPersonalInfo | null;
  familyInfo?: EmployeeApplicationFamilyInfo | null;
  additionalInfo?: EmployeeApplicationAdditionalInfo | null;
  workExperiences?: EmployeeApplicationWorkExperience[];
  tokenExpiresAt: string;
  linkLastIssuedAt: string;
  submittedAt?: string | null;
  finalizedAt?: string | null;
  finalizedEmployeeId?: string | null;
  hasResume: boolean;
  hasPhoto: boolean;
  resumeFileName?: string | null;
  resumeContentType?: string | null;
  resumeSize?: number | null;
  photoFileName?: string | null;
  photoContentType?: string | null;
  photoSize?: number | null;
  statusReason?: string | null;
  creationTime: string;
};

export type EmployeeApplicationListResponse = {
  totalCount: number;
  items: EmployeeApplication[];
};

export type EmployeeApplicationInviteResponse = {
  application: EmployeeApplication;
  token: string;
  publicPath: string;
  tokenExpiresAt: string;
  emailDeliverySucceeded: boolean;
  emailDeliveryMessage?: string | null;
};

export type PublicEmployeeApplication = {
  id: string;
  applicationNumber: string;
  status: EmployeeApplicationStatus | string | number;
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  mobileNo?: string;
  positionAppliedFor?: string;
  departmentAppliedFor?: string;
  workAssignment?:
    import('src/screens/hr/employee-onboarding/work-assignment').EmployeeWorkAssignment | null;
  workAssignmentDisplay?: string;
  tokenExpiresAt: string;
  canSubmit: boolean;
  isExpired: boolean;
  isSubmitted: boolean;
};

const buildListParams = (args?: Record<string, unknown>) => {
  const params: Record<string, unknown> = {
    skipCount: 0,
    maxResultCount: 20,
    ...(args ?? {}),
  };

  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
};

export const employeeOnboardingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeApplications: builder.query<
      EmployeeApplicationListResponse,
      Record<string, unknown> | void
    >({
      query: (args) => ({
        url: '/employee-applications',
        method: 'GET',
        params: buildListParams(args ?? undefined),
      }),
      providesTags: [employeeType.employeeApplication],
    }),
    createEmployeeApplicationInvite: builder.mutation<
      EmployeeApplicationInviteResponse,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: '/employee-applications',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.employeeApplication],
    }),
    getEmployeeApplication: builder.query<EmployeeApplication, string>({
      query: (id) => ({ url: `/employee-applications/${id}` }),
      providesTags: [employeeType.employeeApplication],
    }),
    updateEmployeeApplicationStatus: builder.mutation<
      EmployeeApplication,
      { id: string; body: { status: EmployeeApplicationStatus; reason?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/employee-applications/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employeeApplication],
    }),
    regenerateEmployeeApplicationLink: builder.mutation<EmployeeApplicationInviteResponse, string>({
      query: (id) => ({
        url: `/employee-applications/${id}/regenerate-link`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.employeeApplication],
    }),
    finalizeEmployeeApplication: builder.mutation<
      {
        application: EmployeeApplication;
        employee: Record<string, unknown>;
        activationReadiness?: import('./compensation-revision-api').EmployeeActivationReadiness;
      },
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `/employee-applications/${id}/finalize`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.employeeApplication, employeeType.employee],
    }),
    deleteEmployeeApplication: builder.mutation<void, string>({
      query: (id) => ({
        url: `/employee-applications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.employeeApplication],
    }),
    getEmployeeApplicationResume: builder.query<Blob, string>({
      query: (id) => ({
        url: `/employee-applications/${id}/resume`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    getEmployeeApplicationPhoto: builder.query<Blob, string>({
      query: (id) => ({
        url: `/employee-applications/${id}/photo`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetEmployeeApplicationsQuery,
  useCreateEmployeeApplicationInviteMutation,
  useGetEmployeeApplicationQuery,
  useUpdateEmployeeApplicationStatusMutation,
  useRegenerateEmployeeApplicationLinkMutation,
  useFinalizeEmployeeApplicationMutation,
  useDeleteEmployeeApplicationMutation,
  useLazyGetEmployeeApplicationResumeQuery,
  useLazyGetEmployeeApplicationPhotoQuery,
} = employeeOnboardingApi;
