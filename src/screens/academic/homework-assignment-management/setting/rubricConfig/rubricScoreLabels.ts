import {
  RubricScoringModel,
  type AssessmentRubricDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

export const getRubricMaximumLabel = (rubric: AssessmentRubricDto & { criteriaCount?: number; hasPerformanceLevels?: boolean }) => {
  if (rubric.scoringModel === RubricScoringModel.WeightedPercentage) {
    return `${rubric.totalMarks}% total weight`;
  }
  if (rubric.scoringModel === RubricScoringModel.Checklist && !(rubric.hasPerformanceLevels ?? Boolean(rubric.performanceLevels.length))) {
    return `${rubric.criteriaCount ?? rubric.criteria.length} checklist items`;
  }
  return `${rubric.totalMarks} points max`;
};
