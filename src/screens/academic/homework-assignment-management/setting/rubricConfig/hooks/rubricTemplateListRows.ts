import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';
import type { RubricTemplateSummaryDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricTemplateReadApi';

export type RubricTemplateListRow = AssessmentRubricDto & {
  criteriaCount?: number;
  usageCount?: number;
  hasPerformanceLevels?: boolean;
};

export const rubricTemplateListRow = (summary: RubricTemplateSummaryDto): RubricTemplateListRow => ({
  ...summary, isTemplate: true, tags: [], criteria: [], performanceLevels: [],
});
