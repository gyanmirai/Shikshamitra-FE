import { Box, Stack, Typography } from '@mui/material';
import {
  RubricScoringModel,
  getRubricCriterionMaximum,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import type { RubricCriterionScoringProps } from './rubricEvaluationTypes';

export default function RubricRecordedCriteria({
  rubric,
  values,
  showFeedback,
}: Pick<RubricCriterionScoringProps, 'rubric' | 'values' | 'showFeedback'>) {
  return (
    <Stack spacing={2}>
      {rubric.criteria.map((criterion) => {
        const value = values[criterion.id];
        const hasScore = Boolean(value?.marks.trim());
        const maximum = getRubricCriterionMaximum(rubric, criterion);
        const level = hasScore
          ? rubric.performanceLevels.find((item) => item.score === Number(value.marks))
          : undefined;
        const checklist =
          rubric.scoringModel === RubricScoringModel.Checklist && !rubric.performanceLevels.length;
        const score = !hasScore
          ? 'Not assessed'
          : checklist
            ? Number(value.marks) === 1
              ? 'Met'
              : 'Not met'
            : `${value.marks} / ${maximum}${rubric.scoringModel === RubricScoringModel.WeightedPercentage ? '%' : ''}`;

        return (
          <Box
            key={criterion.id}
            component="section"
            sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={0.5}
              justifyContent="space-between"
            >
              <Typography component="h3" variant="subtitle2" fontWeight={600}>
                {criterion.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: 0,
                  textAlign: { xs: 'left', sm: 'right' },
                }}
              >
                {rubric.scoringModel === RubricScoringModel.RatingScale ? 'Rating: ' : ''}
                {score}
                {level ? ` (${level.label})` : ''}
              </Typography>
            </Stack>
            {criterion.description && (
              <Typography variant="body2" color="text.secondary">
                {criterion.description}
              </Typography>
            )}
            {criterion.teacherGuidance && (
              <Typography variant="body2" color="text.secondary">
                Teacher guidance: {criterion.teacherGuidance}
              </Typography>
            )}
            {showFeedback && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Criterion feedback
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {value?.comments.trim() ? value.comments : 'No criterion feedback recorded.'}
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
