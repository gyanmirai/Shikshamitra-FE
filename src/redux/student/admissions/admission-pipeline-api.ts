import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { studentAcademicFilterParams } from 'src/utils/student-academic-filter-query';

import type { AdmissionApplicationStatus } from './admission-applications-api';

export type AdmissionPipelineItem = {
  id: string;
  applicationNumber: string;
  applicantId: string;
  applicantName: string;
  inquiryId: string;
  inquiryNumber?: string | null;
  sourceInquiryAvailable: boolean;
  offeringCode?: string | null;
  standardName?: string | null;
  status: AdmissionApplicationStatus;
  currentStageInstanceId?: string | null;
  currentStageName?: string | null;
  currentStageCode?: string | null;
  stageType?: number | null;
  nextRequiredAction?: string | null;
  enteredAt?: string | null;
  dueAt?: string | null;
  assignedCounsellorId?: string | null;
  assignedCounsellorName?: string | null;
  openFollowUpCount: number;
  nextFollowUpAt?: string | null;
  hasOverdueFollowUp: boolean;
  contactPhone?: string | null;
  contactEmail?: string | null;
};
export type AdmissionPipelineAcademicInput = {
  academicYearId: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  standardIds?: string[];
};
export type AdmissionPipelineListInput = AdmissionPipelineAcademicInput & {
  myCases?: boolean;
  assignedCounsellorId?: string;
  currentStageCode?: string;
  status?: AdmissionApplicationStatus;
  search?: string;
  sorting?: string;
  skipCount: number;
  maxResultCount: number;
};
export type AdmissionPipelineOptions = {
  defaultMyCases: boolean;
  currentUserId?: string | null;
  counsellors: { id: string; name: string }[];
  stages: { code: string; name: string }[];
};
const unwrap = <T>(response: T | { data: T }): T =>
  response && typeof response === 'object' && 'data' in response ? response.data : (response as T);
const url = '/student/enrollment/admissions/applications/pipeline';
const tags = [
  studentAdmissionsCrmType.admissionApplication,
  studentAdmissionsCrmType.admissionInquiry,
];

export const admissionPipelineApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionPipeline: builder.query<
      { items: AdmissionPipelineItem[]; totalCount: number },
      AdmissionPipelineListInput
    >({
      query: (params) => ({ url, params: studentAcademicFilterParams(params) }),
      transformResponse: unwrap<{ items: AdmissionPipelineItem[]; totalCount: number }>,
      providesTags: tags,
    }),
    getAdmissionPipelineOptions: builder.query<
      AdmissionPipelineOptions,
      AdmissionPipelineAcademicInput
    >({
      query: (params) => ({ url: `${url}/options`, params: studentAcademicFilterParams(params) }),
      transformResponse: unwrap<AdmissionPipelineOptions>,
      providesTags: tags,
    }),
  }),
});

export const { useGetAdmissionPipelineQuery, useGetAdmissionPipelineOptionsQuery } =
  admissionPipelineApi;
