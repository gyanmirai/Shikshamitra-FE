import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import { ASSESSMENTS_URL, unwrapAssessment } from './admission-assessment-types';

import type { ApplicationAssessment } from './admission-assessment-types';

export type AssessmentProgress = 'pending' | 'ongoing' | 'complete';
export type AssessmentQueue =
  'toBook' | 'attendance' | 'result' | 'review' | 'ready' | 'attention' | 'completed';
export type AssessmentRosterItem = {
  admissionOfferingId?: string;
  workflowStageDefinitionId?: string;
  className?: string;
  status?: AssessmentProgress;
  offeringName?: string;
  workflowVersion?: number;
  interviewerName?: string | null;
  applicationId: string;
  applicationNumber: string;
  applicantId: string;
  applicantName: string;
  stageInstanceId: string;
  stageName: string;
  applicationStatus: number;
  stageStatus: number;
  isActive: boolean;
  enteredAt?: string | null;
  queue: AssessmentQueue;
  assessment: ApplicationAssessment;
};
export type AssessmentRoster = {
  totalCount: number;
  items: AssessmentRosterItem[];
  counts: Record<AssessmentQueue | 'all', number>;
  statusCounts?: Record<AssessmentProgress | 'all', number>;
};
export type AssessmentRosterQuery = {
  admissionOfferingId?: string;
  workflowStageDefinitionId?: string;
  academicYearId?: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  standardIds?: string;
  sessionId?: string;
  search?: string;
  columnFilters?: string;
  queue?: AssessmentQueue;
  status?: AssessmentProgress;
  sorting?: string;
  skipCount: number;
  maxResultCount: number;
};

export const admissionAssessmentRosterApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAssessmentApplicants: builder.query<AssessmentRoster, AssessmentRosterQuery>({
      query: (params) => ({ url: `${ASSESSMENTS_URL}/applicants`, params }),
      transformResponse: unwrapAssessment<AssessmentRoster>,
      providesTags: [tags.exam, tags.admissionApplication],
    }),
  }),
});

export const { useGetAssessmentApplicantsQuery } = admissionAssessmentRosterApi;
