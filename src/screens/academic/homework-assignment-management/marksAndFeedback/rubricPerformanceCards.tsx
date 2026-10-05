import { Stack } from '@mui/material';
import { RubricScoringModel , getRubricCriterionMaximum } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricCriterionCard from './rubricCriterionCard';

import type { RubricCriterionScoringProps } from './rubricEvaluationTypes';

const RubricPerformanceCards = ({
  rubric,
  values,
  onMarksChange,
  onCommentsChange,
  showFeedback,
  readOnly,
  compact,
}: RubricCriterionScoringProps) => {
  const orderedLevels = [...rubric.performanceLevels].sort(
    (left, right) => right.level - left.level
  );

  return (
    <Stack spacing={1.5}>
      {rubric.criteria.map((criterion, criterionIndex) => (
        <RubricCriterionCard
          key={criterion.id}
          criterion={criterion}
          criterionIndex={criterionIndex}
          maximumScore={getRubricCriterionMaximum(rubric, criterion)}
          levels={orderedLevels.filter((level) => level.score <= getRubricCriterionMaximum(rubric, criterion))}
          value={values[criterion.id] ?? { marks: '', comments: '' }}
          onMarksChange={onMarksChange}
          onCommentsChange={onCommentsChange}
          showFeedback={showFeedback}
          readOnly={readOnly}
          compact={compact}
          isRatingScale={rubric.scoringModel === RubricScoringModel.RatingScale}
        />
      ))}
    </Stack>
  );
};

export default RubricPerformanceCards;
