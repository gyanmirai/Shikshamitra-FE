import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

import type { GetRubricsParams, AssessmentRubricDto } from './RubricAssessmentApi';

export type RubricTemplateSummaryDto = Pick<AssessmentRubricDto,
  'id' | 'title' | 'academicMediumId' | 'appliesToWorkType' | 'scoringModel' | 'visibility' |
  'totalMarks' | 'version' | 'status' | 'creationTime' | 'lastModificationTime'> & {
  criteriaCount: number;
  usageCount: number;
  hasPerformanceLevels: boolean;
};

export type RubricTemplateCounts = {
  total: number; published: number; draft: number; archived: number; linked: number;
};

export type RubricTemplatePage = {
  items: RubricTemplateSummaryDto[]; totalCount: number; page: number; pageSize: number;
  summary: RubricTemplateCounts;
};

export type RubricTemplatePageParams = GetRubricsParams & {
  page: number; pageSize: number; filters?: string; sorts?: string; timeZoneId?: string;
};

export const rubricTemplateReadApi = academicApi.injectEndpoints({
  endpoints: builder => ({
    getRubricTemplates: builder.query<RubricTemplatePage, RubricTemplatePageParams>({
      query: params => ({ url: '/academic/rubrics/templates/paged', method: 'GET', params }),
      providesTags: [academicType.assessmentRubric],
    }),
  }),
  overrideExisting: false,
});

export const { useGetRubricTemplatesQuery, useLazyGetRubricTemplatesQuery } = rubricTemplateReadApi;
