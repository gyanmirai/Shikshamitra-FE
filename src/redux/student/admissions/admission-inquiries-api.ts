import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionInquiryStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type AdmissionInquirySource = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type AdmissionInquiry = {
  id: string;
  inquiryNumber: string;
  admissionCycleId: string;
  admissionOfferingId?: string | null;
  applicantId?: string | null;
  assignedCounsellorId?: string | null;
  applicantName: string;
  normalizedPhone: string;
  email?: string | null;
  source: AdmissionInquirySource;
  status: AdmissionInquiryStatus;
  lastActivityAt?: string | null;
};
export type AdmissionInquiryListInput = {
  admissionCycleId?: string;
  admissionOfferingId?: string;
  status?: AdmissionInquiryStatus;
  source?: AdmissionInquirySource;
  assignedCounsellorId?: string;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
};
export type CreateAdmissionInquiry = {
  admissionCycleId: string;
  admissionOfferingId?: string | null;
  existingFamilyId?: string | null;
  createSeparateFamily?: boolean;
  duplicateOverrideReason?: string | null;
  applicantName: string;
  phone: string;
  email?: string | null;
  source: AdmissionInquirySource;
  sourceDetail?: string | null;
  guardianFirstName: string;
  guardianLastName?: string | null;
  guardianPhone: string;
  guardianEmail?: string | null;
  applicantFirstName: string;
  applicantLastName?: string | null;
  applicantDateOfBirth?: string | null;
  formValues?: { fieldCode: string; valueJson?: string | null }[];
};
export type DuplicateMatch = {
  applicantId: string;
  familyId: string;
  applicantName: string;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  dateOfBirth?: string | null;
};
type Result<T> = { data?: T };
const unwrap = <T>(response: Result<T> | T): T => {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    response.data !== undefined
  )
    return response.data;
  return response as T;
};
export const admissionInquiriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionInquiries: builder.query<
      { totalCount: number; items: AdmissionInquiry[] },
      AdmissionInquiryListInput
    >({
      query: (params) => ({ url: '/student/enrollment/admissions/inquiries', params }),
      transformResponse: (
        response:
          | Result<{ totalCount: number; items: AdmissionInquiry[] }>
          | { totalCount: number; items: AdmissionInquiry[] }
      ) => unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
    markAdmissionInquiryContacted: builder.mutation<AdmissionInquiry, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/inquiries/${id}/contacted`,
        method: 'POST',
      }),
      transformResponse: (response: Result<AdmissionInquiry> | AdmissionInquiry) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
    createAdmissionInquiry: builder.mutation<AdmissionInquiry, CreateAdmissionInquiry>({
      query: (body) => ({ url: '/student/enrollment/admissions/inquiries', method: 'POST', body }),
      transformResponse: (response: Result<AdmissionInquiry> | AdmissionInquiry) =>
        unwrap(response),
      invalidatesTags: [
        studentAdmissionsCrmType.admissionInquiry,
        studentAdmissionsCrmType.admissionApplicant,
      ],
    }),
    checkAdmissionInquiryDuplicates: builder.mutation<
      DuplicateMatch[],
      {
        admissionCycleId: string;
        guardianPhone: string;
        guardianEmail?: string;
        applicantName: string;
        applicantDateOfBirth?: string;
      }
    >({
      query: (body) => ({
        url: '/student/enrollment/admissions/inquiries/duplicate-check',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<DuplicateMatch[]> | DuplicateMatch[]) =>
        unwrap(response),
    }),
  }),
});
export const {
  useGetAdmissionInquiriesQuery,
  useMarkAdmissionInquiryContactedMutation,
  useCreateAdmissionInquiryMutation,
  useCheckAdmissionInquiryDuplicatesMutation,
} = admissionInquiriesApi;
