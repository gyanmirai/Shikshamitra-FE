import { Card, Stack, TextField, Typography } from '@mui/material';

import RubricPerformanceCards from './rubricPerformanceCards';
import { usesPerformanceLevels } from './rubricEvaluationUtils';
import RubricPerformanceMatrix from './rubricPerformanceMatrix';

import type { RubricCriterionScoringProps } from './rubricEvaluationTypes';

const RubricCriterionScoring = (props: RubricCriterionScoringProps) => {
  const { rubric, values, onMarksChange, onCommentsChange, readOnly } = props;
  if (usesPerformanceLevels(rubric)) {
    return (
      <>
        <RubricPerformanceMatrix {...props} />
        <RubricPerformanceCards {...props} />
      </>
    );
  }

  return (
    <Stack spacing={1}>
      {rubric.criteria.map((criterion) => {
        const criterionValue = values[criterion.id] ?? { marks: '', comments: '' };

        return (
          <Card key={criterion.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  {criterion.title}
                  {criterion.isRequired ? ' *' : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Max {criterion.maxMarks}
                </Typography>
              </Stack>

              {criterion.description ? (
                <Typography variant="caption" color="text.secondary">
                  {criterion.description}
                </Typography>
              ) : null}

              <TextField
                size="small"
                type="number"
                label="Marks"
                required={criterion.isRequired}
                value={criterionValue.marks}
                onChange={(event) => onMarksChange(criterion.id, event.target.value)}
                inputProps={{ min: 0, max: criterion.maxMarks, step: 0.5 }}
                sx={{ width: { xs: '100%', sm: 150 } }}
                disabled={readOnly}
              />

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
