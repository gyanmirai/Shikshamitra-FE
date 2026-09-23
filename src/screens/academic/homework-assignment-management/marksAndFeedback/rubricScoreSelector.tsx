import type {
  RubricPerformanceLevelDto,
  AssessmentRubricCriterionDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { Box, Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

type RubricScoreSelectorProps = {
  criterion: AssessmentRubricCriterionDto;
  levels: RubricPerformanceLevelDto[];
  marks: string;
  onMarksChange: (criterionId: string, marks: string) => void;
  readOnly?: boolean;
};

const RubricScoreSelector = ({
  criterion,
  levels,
  marks,
  onMarksChange,
  readOnly,
}: RubricScoreSelectorProps) => (
  <Box component="fieldset" sx={{ p: 0, m: 0, border: 0, minWidth: 0 }}>
    <Typography
      component="legend"
      variant="caption"
      fontWeight={600}
      color="text.secondary"
      sx={{ mb: 1 }}
    >
      Select a score
    </Typography>
    <ToggleButtonGroup
      fullWidth
      exclusive
      disabled={readOnly}
      value={marks}
      onChange={(_event, selectedMarks: string | null) => {
        if (selectedMarks !== null) onMarksChange(criterion.id, selectedMarks);
      }}
      aria-label={`${criterion.title} performance level`}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: `repeat(${Math.max(levels.length, 1)}, minmax(0, 1fr))`,
        },
        gap: 1,
        '& .MuiToggleButtonGroup-grouped': {
          m: 0,
          minHeight: 56,
          px: 1.25,
          border: '1px solid !important',
          borderColor: 'divider !important',
          borderRadius: '8px !important',
        },
        '& .MuiToggleButton-root.Mui-selected': {
          color: 'text.primary',
          bgcolor: 'action.selected',
          borderColor: 'text.primary !important',
        },
        '& .MuiToggleButton-root.Mui-selected:hover': {
          bgcolor: 'action.selected',
        },
      }}
    >
      {levels.map((level) => (
        <ToggleButton
          key={`${level.level}-${level.label}`}
          value={String(level.score)}
          disabled={readOnly}
          aria-label={`${criterion.title}: ${level.label}, ${level.score} points`}
        >
          <Stack spacing={0.25} alignItems="flex-start" sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={600} textAlign="left">
              {level.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {level.score} {level.score === 1 ? 'point' : 'points'}
            </Typography>
          </Stack>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Box>
);

export default RubricScoreSelector;
