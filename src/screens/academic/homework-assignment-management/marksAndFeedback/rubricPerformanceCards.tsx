import { Stack } from '@mui/material';

import RubricCriterionCard from './rubricCriterionCard';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import type { RubricCriterionScoringProps } from './rubricEvaluationTypes';

const RubricPerformanceCards = ({
  rubric,
  values,
  onMarksChange,
  onCommentsChange,
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
          levels={orderedLevels.filter((level) => level.score <= criterion.maxMarks)}
          value={values[criterion.id] ?? { marks: '', comments: '' }}
          onMarksChange={onMarksChange}
          onCommentsChange={onCommentsChange}
          readOnly={readOnly}
          compact={compact}
          isRatingScale={rubric.scoringModel === RubricScoringModel.RatingScale}
        />
      ))}
    </Stack>
  );
};

export default RubricPerformanceCards;
