import { Card, Stack, TextField, Typography, IconButton } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { Iconify } from 'src/components/iconify';

import RubricPerformanceCards from './rubricPerformanceCards';
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
                  Max {criterion.maxMarks}
                </Typography>
              </Stack>

              {!compact && criterion.description ? (
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
