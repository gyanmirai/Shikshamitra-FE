import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Card, Stack, Checkbox, TextField, Typography, IconButton, FormControlLabel } from '@mui/material';
import { RubricScoringModel , getRubricCriterionMaximum } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricPerformanceCards from './rubricPerformanceCards';
import WeightedPercentageInput from './weightedPercentageInput';
import { usesPerformanceLevels } from './rubricEvaluationUtils';

import type { RubricCriterionScoringProps } from './rubricEvaluationTypes';

const RubricCriterionScoring = (props: RubricCriterionScoringProps) => {
  const { rubric, values, onMarksChange, onCommentsChange, readOnly, compact } = props;
  if (usesPerformanceLevels(rubric)) {
    return <RubricPerformanceCards {...props} />;
  }

  return (
    <Stack spacing={1}>
      {rubric.criteria.map((criterion) => {
        const criterionValue = values[criterion.id] ?? { marks: '', comments: '' };
        const maxAllowed = Math.min(getRubricCriterionMaximum(rubric, criterion), 1000);
        const numericMarks = Number(criterionValue.marks);
        const invalidMarks = criterionValue.marks !== '' &&
          (!Number.isFinite(numericMarks) || numericMarks < 0 || numericMarks > maxAllowed);

        return (
          <Card key={criterion.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    {criterion.title}
                    {criterion.isRequired ? ' *' : ''}
                  </Typography>
                  {compact && (criterion.description || criterion.teacherGuidance) ? (
                    <CustomTooltip
                      title={
                        <Stack spacing={0.5} sx={{ p: 1.5, maxWidth: 320 }}>
                          {criterion.description ? (
                            <Typography variant="body2">{criterion.description}</Typography>
                          ) : null}
                          {criterion.teacherGuidance ? (
                            <Typography variant="body2">
                              Teacher guidance: {criterion.teacherGuidance}
                            </Typography>
                          ) : null}
                        </Stack>
                      }
                      placement="right"
                      arrow
                    >
                      <IconButton size="small" aria-label={`About ${criterion.title}`}>
                        <Iconify icon="lucide:info" width={18} color="info.main" />
                      </IconButton>
                    </CustomTooltip>
                  ) : null}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {rubric.scoringModel === RubricScoringModel.WeightedPercentage
                    ? `Weight ${getRubricCriterionMaximum(rubric, criterion)}%`
                    : rubric.scoringModel === RubricScoringModel.Checklist
                      ? 'Checklist item'
                      : `Max ${getRubricCriterionMaximum(rubric, criterion)}`}
                </Typography>
              </Stack>

              {!compact && criterion.description ? (
                <Typography variant="caption" color="text.secondary">
                  {criterion.description}
                </Typography>
              ) : null}

              {rubric.scoringModel === RubricScoringModel.Checklist ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={criterionValue.marks === '1'}
                      indeterminate={criterionValue.marks === ''}
                      disabled={readOnly}
                      onChange={(_event, checked) => onMarksChange(criterion.id, checked ? '1' : '0')}
                      inputProps={{ 'aria-label': `${criterion.title}: Met` }}
                    />
                  }
                  label={criterionValue.marks === '' ? 'Not assessed' : criterionValue.marks === '1' ? 'Met' : 'Not met'}
                />
              ) : rubric.scoringModel === RubricScoringModel.WeightedPercentage ? (
                <WeightedPercentageInput
                  marks={criterionValue.marks}
                  weight={getRubricCriterionMaximum(rubric, criterion)}
                  required={criterion.isRequired}
                  readOnly={readOnly}
                  onChange={(marks) => onMarksChange(criterion.id, marks)}
                />
              ) : (
                <TextField
                  size="small"
                  type="number"
                  label="Points earned"
                  required={criterion.isRequired}
                  value={criterionValue.marks}
                  onChange={(event) => onMarksChange(criterion.id, event.target.value)}
                  inputProps={{ min: 0, max: maxAllowed, step: 0.5 }}
                  error={invalidMarks}
                  helperText={invalidMarks ? `Enter 0–${maxAllowed}` : undefined}
                  sx={{ width: { xs: '100%', sm: 150 } }}
                  disabled={readOnly}
                />
              )}

              <TextField
                size="small"
                label={`${criterion.title} Feedback`}
                value={criterionValue.comments}
                onChange={(event) => onCommentsChange(criterion.id, event.target.value)}
                placeholder="Add criterion-specific feedback"
                multiline
                minRows={1}
                disabled={readOnly}
              />
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
};

export default RubricCriterionScoring;
