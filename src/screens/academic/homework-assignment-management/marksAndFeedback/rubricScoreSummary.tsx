import { GlobalIcons } from 'src/utils/icons';
import { FormSectionHeader } from 'src/components/form-section-card';
import { Box, Paper, Stack, Divider, TextField, Typography } from '@mui/material';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

type Props = {
  totalMarks: number;
  maxMarks: number;
  scoringModel?: RubricScoringModel;
  remarks: string;
  onRemarksChange: (remarks: string) => void;
  readOnly?: boolean;
  compact?: boolean;
};

export default function RubricScoreSummary({
  totalMarks,
  maxMarks,
  scoringModel,
  remarks,
  onRemarksChange,
  readOnly,
  compact,
}: Props) {
  return (
    <Paper
      component="section"
      aria-labelledby="rubric-score-summary"
      variant="outlined"
      sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={0.5}
        >
          <Box>
            <FormSectionHeader
              title="Score Summary"
              icon={GlobalIcons.usage}
              titleTypographyProps={{
                id: 'rubric-score-summary',
                component: 'h3',
                variant: 'subtitle1',
                fontWeight: 600,
              }}
              descriptionTooltip="Total recorded score across the rubric criteria and feedback for the complete assessment."
            />
            {!compact && !readOnly ? (
              <Typography variant="caption" color="text.secondary">
                Updates automatically as criteria are scored.
              </Typography>
            ) : null}
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontVariantNumeric: 'tabular-nums',
              color: 'text.primary',
            }}
          >
            {Number(totalMarks.toFixed(2))}
            <Typography component="span" variant="body2" color="text.secondary">
              {' '}
              {scoringModel === RubricScoringModel.WeightedPercentage
                ? `/ ${maxMarks}%`
                : scoringModel === RubricScoringModel.Checklist
                  ? `/ ${maxMarks} items met`
                  : `/ ${maxMarks}`}
            </Typography>
          </Typography>
        </Stack>

        <Divider />

        {readOnly ? (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Overall rubric feedback
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {remarks.trim() ? remarks : 'No overall rubric feedback recorded.'}
            </Typography>
          </Box>
        ) : (
          <TextField
            fullWidth
            size="small"
            label="Overall rubric feedback (optional)"
            value={remarks}
            onChange={(event) => onRemarksChange(event.target.value)}
            placeholder="Summarize the student's overall performance"
            multiline
            rows={3}
            disabled={readOnly}
            helperText={
              compact ? undefined : 'This note applies to the complete rubric assessment.'
            }
          />
        )}
      </Stack>
    </Paper>
  );
}
