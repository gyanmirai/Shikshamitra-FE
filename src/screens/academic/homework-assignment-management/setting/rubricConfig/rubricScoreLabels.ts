import {
  RubricScoringModel,
  type AssessmentRubricDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

export const getRubricMaximumLabel = (rubric: AssessmentRubricDto) => {
  if (rubric.scoringModel === RubricScoringModel.WeightedPercentage) {
    return `${rubric.totalMarks}% total weight`;
  }
  if (rubric.scoringModel === RubricScoringModel.Checklist && !rubric.performanceLevels.length) {
    return `${rubric.criteria.length} checklist items`;
  }
  return `${rubric.totalMarks} points max`;
};
