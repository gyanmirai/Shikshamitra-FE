import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionApplicant360 = {
  applicant: {
    id: string;
    familyId: string;
    firstName: string;
    middleName?: string | null;
    lastName?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
  };
  family?: { id: string; familyNumber: string };
  primaryGuardian?: {
    firstName: string;
    lastName?: string | null;
    mobile: string;
    email?: string | null;
  };
  applications: {
    id: string;
    applicationNumber: string;
    status: number;
    currentStageInstanceId?: string | null;
    stages: {
      code: string;
      name: string;
      stageType: number;
      status: number;
      displayOrder: number;
    }[];
  }[];
  activities: { id: string; activityType: string; description: string; occurredAt: string }[];
  notes: { id: string; text: string; creationTime: string }[];
};
export type AdmissionApplicantNote = {
  id: string;
  applicantId: string;
  text: string;
  creationTime: string;
  lastEditedAt?: string | null;
  creatorId?: string | null;
};
type Result<T> = { data?: T };
const unwrap = <T>(response: Result<T> | T): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data
    : (response as T);
export const admissionApplicantsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionApplicant360: builder.query<AdmissionApplicant360, string>({
      query: (id) => `/student/enrollment/admissions/applicants/${id}`,
      transformResponse: (response: Result<AdmissionApplicant360> | AdmissionApplicant360) =>
        unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionApplicant],
    }),
    createAdmissionApplicantNote: builder.mutation<
      AdmissionApplicantNote,
      { applicantId: string; text: string }
    >({
      query: ({ applicantId, text }) => ({
        url: `/student/enrollment/admissions/applicants/${applicantId}/notes`,
        method: 'POST',
        body: { text },
      }),
      transformResponse: (response: Result<AdmissionApplicantNote> | AdmissionApplicantNote) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionApplicant],
    }),
    updateAdmissionApplicantNote: builder.mutation<
      AdmissionApplicantNote,
      { applicantId: string; noteId: string; text: string }
    >({
      query: ({ applicantId, noteId, text }) => ({
        url: `/student/enrollment/admissions/applicants/${applicantId}/notes/${noteId}`,
        method: 'PUT',
        body: { text },
      }),
      transformResponse: (response: Result<AdmissionApplicantNote> | AdmissionApplicantNote) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionApplicant],
    }),
  }),
});
export const {
  useGetAdmissionApplicant360Query,
  useCreateAdmissionApplicantNoteMutation,
  useUpdateAdmissionApplicantNoteMutation,
} = admissionApplicantsApi;
