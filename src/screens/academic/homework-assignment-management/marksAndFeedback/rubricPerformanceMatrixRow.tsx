import type {
  RubricPerformanceLevelDto,
  AssessmentRubricCriterionDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Chip, Stack, TableRow, TableCell, TextField, ButtonBase, Typography } from '@mui/material';

import type { CriterionEvaluationValue } from './rubricEvaluationTypes';

type RubricPerformanceMatrixRowProps = {
  criterion: AssessmentRubricCriterionDto;
  levels: RubricPerformanceLevelDto[];
  value: CriterionEvaluationValue;
  onMarksChange: (criterionId: string, marks: string) => void;
  onCommentsChange: (criterionId: string, comments: string) => void;
};

const RubricPerformanceMatrixRow = ({
  criterion,
  levels,
  value,
  onMarksChange,
  onCommentsChange,
}: RubricPerformanceMatrixRowProps) => (
  <>
    <TableRow>
      <TableCell component="th" scope="row">
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
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
          {criterion.teacherGuidance ? (
            <Typography variant="caption" color="info.main">
              Guidance: {criterion.teacherGuidance}
            </Typography>
          ) : null}
        </Stack>
      </TableCell>

      {levels.map((level) => {
        const available = level.score <= criterion.maxMarks;
        const selected = value.marks === String(level.score);

        return (
          <TableCell key={`${criterion.id}-${level.level}`} align="center" sx={{ p: 0.5 }}>
            {available ? (
              <ButtonBase
                aria-label={`${criterion.title}: ${level.label}, ${level.score} points`}
                aria-pressed={selected}
                onClick={() => onMarksChange(criterion.id, String(level.score))}
                sx={{
                  width: '100%',
                  minHeight: 48,
                  border: 1,
                  borderColor: selected ? 'primary.main' : 'transparent',
                  borderRadius: 1,
                  bgcolor: selected ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: selected ? 'action.selected' : 'action.hover' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {selected ? (
                    <Iconify icon="solar:check-circle-bold" color="primary.main" />
                  ) : null}
                  <Typography variant="body2" fontWeight={selected ? 700 : 500}>
                    {level.score}
                  </Typography>
                </Stack>
              </ButtonBase>
            ) : (
              <Typography variant="body2" color="text.disabled" aria-label="Not available">
                —
              </Typography>
            )}
          </TableCell>
        );
      })}
    </TableRow>

    <TableRow>
      <TableCell colSpan={levels.length + 1} sx={{ pt: 0, pb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          label={`${criterion.title} Feedback`}
          value={value.comments}
          onChange={(event) => onCommentsChange(criterion.id, event.target.value)}
          placeholder="Add criterion-specific feedback"
        />
      </TableCell>
    </TableRow>
  </>
);

export default RubricPerformanceMatrixRow;
