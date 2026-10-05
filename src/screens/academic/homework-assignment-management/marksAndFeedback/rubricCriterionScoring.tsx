import { useEffect, useRef, useState } from 'react';
import { Card, Stack, TextField, Typography, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { Iconify } from 'src/components/iconify';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricPerformanceCards from './rubricPerformanceCards';
import { usesPerformanceLevels } from './rubricEvaluationUtils';

import type { RubricCriterionScoringProps } from './rubricEvaluationTypes';

const percentageFromMarks = (marks: string, weight: number) =>
  marks === '' || !weight ? '' : String(Number(((Number(marks) / weight) * 100).toFixed(2)));

function WeightedPercentageInput({
  marks,
  weight,
  required,
  readOnly,
  onChange,
}: {
  marks: string;
  weight: number;
  required: boolean;
  readOnly?: boolean;
  onChange: (marks: string) => void;
}) {
  const [percentage, setPercentage] = useState(() => percentageFromMarks(marks, weight));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setPercentage(percentageFromMarks(marks, weight));
  }, [marks, weight]);
  const numeric = Number(percentage);
  const invalid = percentage !== '' && (!Number.isFinite(numeric) || numeric < 0 || numeric > 100);

  return (
    <TextField
      size="small"
      type="number"
      label="Achievement %"
      required={required}
      value={percentage}
      inputProps={{ min: 0, max: 100, step: 0.01 }}
      onFocus={() => { focused.current = true; }}
      onBlur={() => {
        focused.current = false;
        if (!invalid) setPercentage(percentageFromMarks(marks, weight));
      }}
      onChange={(event) => {
        const next = event.target.value;
        setPercentage(next);
        onChange(next === '' ? '' : Number.isFinite(Number(next))
          ? String(Number(((Number(next) / 100) * weight).toFixed(4)))
          : next);
      }}
      error={invalid}
      helperText={invalid ? 'Enter a percentage from 0 to 100' : `${weight}% of the total`}
      sx={{ width: { xs: '100%', sm: 190 } }}
      disabled={readOnly}
    />
  );
}

const RubricCriterionScoring = (props: RubricCriterionScoringProps) => {
  const {
    rubric, values, onMarksChange, onCommentsChange, showFeedback = true, readOnly, compact,
  } = props;
  if (usesPerformanceLevels(rubric)) {
    return <RubricPerformanceCards {...props} />;
  }

  return (
    <Stack spacing={1}>
      {rubric.criteria.map((criterion) => {
        const criterionValue = values[criterion.id] ?? { marks: '', comments: '' };
        const maxAllowed = Math.min(criterion.maxMarks, 1000);
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
                    ? `Weight ${criterion.maxMarks}%`
                    : rubric.scoringModel === RubricScoringModel.Checklist
                      ? '1 point'
                      : `Max ${criterion.maxMarks}`}
                </Typography>
              </Stack>

              {!compact && criterion.description ? (
                <Typography variant="caption" color="text.secondary">
                  {criterion.description}
                </Typography>
              ) : null}

              {rubric.scoringModel === RubricScoringModel.Checklist ? (
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={criterionValue.marks}
                  onChange={(_event, value: string | null) => {
                    if (value !== null) onMarksChange(criterion.id, value);
                  }}
                  aria-label={`${criterion.title} checklist result`}
                  disabled={readOnly}
                >
                  <ToggleButton value="1" aria-label={`${criterion.title}: Met`}>Met</ToggleButton>
                  <ToggleButton value="0" aria-label={`${criterion.title}: Not met`}>Not met</ToggleButton>
                </ToggleButtonGroup>
              ) : rubric.scoringModel === RubricScoringModel.WeightedPercentage ? (
                <WeightedPercentageInput
                  marks={criterionValue.marks}
                  weight={criterion.maxMarks}
                  required={criterion.isRequired}
                  readOnly={readOnly}
                  onChange={(marks) => onMarksChange(criterion.id, marks)}
                />
              ) : (
                <TextField
                  size="small"
                  type="number"
                  label="Marks"
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

              {showFeedback && (
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
              )}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
};

export default RubricCriterionScoring;
