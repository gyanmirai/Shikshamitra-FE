import type {
  RubricPerformanceLevelDto,
  AssessmentRubricCriterionDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { Box, Card, Chip, Stack, Divider, TextField, Typography } from '@mui/material';

import RubricScoreSelector from './rubricScoreSelector';

import type { CriterionEvaluationValue } from './rubricEvaluationTypes';

type RubricCriterionCardProps = {
  criterion: AssessmentRubricCriterionDto;
  criterionIndex: number;
  levels: RubricPerformanceLevelDto[];
  value: CriterionEvaluationValue;
  onMarksChange: (criterionId: string, marks: string) => void;
  onCommentsChange: (criterionId: string, comments: string) => void;
  readOnly?: boolean;
};

const RubricCriterionCard = ({
  criterion,
  criterionIndex,
  levels,
  value,
  onMarksChange,
  onCommentsChange,
  readOnly,
}: RubricCriterionCardProps) => {
  const headingId = `rubric-criterion-${criterion.id}`;

  return (
    <Card
      component="section"
      aria-labelledby={headingId}
      variant="outlined"
      sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Criterion {criterionIndex + 1}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography id={headingId} component="h3" variant="subtitle2" fontWeight={700}>
                {criterion.title}
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                label={criterion.isRequired ? 'Required' : 'Optional'}
                sx={{ bgcolor: 'transparent' }}
              />
            </Stack>

            {criterion.description ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                {criterion.description}
              </Typography>
            ) : null}

            {criterion.teacherGuidance ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.75 }}
              >
                Teacher guidance: {criterion.teacherGuidance}
              </Typography>
            ) : null}
          </Box>

          <Box
            sx={{
              minWidth: 96,
              px: 1.25,
              py: 0.75,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              textAlign: { xs: 'left', sm: 'center' },
              alignSelf: { xs: 'flex-start', sm: 'auto' },
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              Score
            </Typography>
            <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {value.marks || '—'} / {criterion.maxMarks}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <RubricScoreSelector
          criterion={criterion}
          levels={levels}
          marks={value.marks}
          onMarksChange={onMarksChange}
          readOnly={readOnly}
        />

        <TextField
          fullWidth
          size="small"
          disabled={readOnly}
          label={`${criterion.title} feedback (optional)`}
          value={value.comments}
          onChange={(event) => onCommentsChange(criterion.id, event.target.value)}
          placeholder="Add a concise note about this criterion"
          multiline
          minRows={2}
        />
      </Stack>
    </Card>
  );
};

export default RubricCriterionCard;
