import {
  Card,
  Chip,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import type { RubricCriterionScoringProps } from './rubricEvaluationTypes';

const RubricPerformanceCards = ({
  rubric,
  values,
  onMarksChange,
  onCommentsChange,
  readOnly,
}: RubricCriterionScoringProps) => (
  <Stack spacing={1} sx={{ display: { xs: 'flex', sm: 'none' } }}>
    {rubric.criteria.map((criterion) => {
      const value = values[criterion.id] ?? { marks: '', comments: '' };
      const levels = rubric.performanceLevels
        .filter((level) => level.score <= criterion.maxMarks)
        .sort((left, right) => right.level - left.level);

      return (
        <Card key={criterion.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Typography variant="body2" fontWeight={600}>
                {criterion.title}
              </Typography>
              <Chip
                size="small"
                variant="soft"
                color={criterion.isRequired ? 'primary' : 'default'}
                label={criterion.isRequired ? 'Required' : 'Optional'}
              />
            </Stack>

            {criterion.description ? (
              <Typography variant="caption" color="text.secondary">
                {criterion.description}
              </Typography>
            ) : null}

            <ToggleButtonGroup
              fullWidth
              exclusive
              disabled={readOnly}
              orientation="vertical"
              value={value.marks}
              onChange={(_event, marks: string | null) => {
                if (marks !== null) onMarksChange(criterion.id, marks);
              }}
              aria-label={`${criterion.title} performance level`}
            >
              {levels.map((level) => (
                <ToggleButton
                  key={`${level.level}-${level.label}`}
                  value={String(level.score)}
                  disabled={readOnly}
                  aria-label={`${level.label}, ${level.score} points`}
                  sx={{ minHeight: 48, justifyContent: 'space-between', px: 1.5 }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {level.label}
                  </Typography>
                  <Typography variant="body2">{level.score}</Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <TextField
              fullWidth
              size="small"
              disabled={readOnly}
              label={`${criterion.title} Feedback`}
              value={value.comments}
              onChange={(event) => onCommentsChange(criterion.id, event.target.value)}
              placeholder="Add criterion-specific feedback"
            />
          </Stack>
        </Card>
      );
    })}
  </Stack>
);

export default RubricPerformanceCards;
