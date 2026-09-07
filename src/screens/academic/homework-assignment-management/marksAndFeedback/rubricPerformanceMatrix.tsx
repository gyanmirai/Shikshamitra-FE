import type { IColumn } from 'src/components/customizabaleTable/types';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, TextField, ButtonBase, Typography } from '@mui/material';

import type { RubricCriterionScoringProps } from './rubricEvaluationTypes';

const RubricPerformanceMatrix = ({
  rubric,
  values,
  onMarksChange,
  onCommentsChange,
  readOnly,
}: RubricCriterionScoringProps) => {
  const levels = React.useMemo(
    () => [...rubric.performanceLevels].sort((left, right) => right.level - left.level),
    [rubric.performanceLevels]
  );

  const columns = React.useMemo<IColumn[]>(
    () => [
      {
        id: 'title',
        label: 'Criterion',
        minWidth: 190,
        width: '26%',
        isSort: false,
        isFilter: false,
        headerSx: { verticalAlign: 'bottom', pb: 1 },
        render: (_value, criterion) => (
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
              <Typography variant="body2" fontWeight={600}>
                {criterion.title}
              </Typography>
              <Label color={criterion.isRequired ? 'primary' : 'default'}>
                {criterion.isRequired ? 'Required' : 'Optional'}
              </Label>
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
        ),
      },
      ...levels.map((level): IColumn => ({
        id: `level-${level.level}`,
        label: (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" fontWeight={700} color="text.primary">
              {level.label}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              {level.score} {level.score === 1 ? 'point' : 'points'}
            </Typography>
          </Box>
        ),
        align: 'center',
        minWidth: 90,
        isSort: false,
        isFilter: false,
        headerSx: { verticalAlign: 'bottom', pb: 1 },
        render: (_value, criterion) => {
          const available = level.score <= criterion.maxMarks;
          const selected = values[criterion.id]?.marks === String(level.score);

          if (!available) {
            return (
              <Typography variant="body2" color="text.disabled" aria-label="Not available">
                —
              </Typography>
            );
          }

          return (
            <ButtonBase
              disabled={readOnly}
              aria-label={`${criterion.title}: ${level.label}, ${level.score} points`}
              aria-pressed={selected}
              onClick={() => onMarksChange(criterion.id, String(level.score))}
              sx={{
                width: '100%',
                minHeight: 44,
                border: 1,
                borderColor: selected ? 'primary.main' : 'divider',
                borderRadius: 1,
                bgcolor: selected ? 'primary.lighter' : 'background.paper',
                cursor: readOnly ? 'default' : 'pointer',
                '&:hover': { bgcolor: selected ? 'primary.lighter' : readOnly ? 'background.paper' : 'action.hover' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {selected ? (
                  <Iconify icon="solar:check-circle-bold" color="primary.main" width={18} />
                ) : null}
                <Typography variant="body2" fontWeight={selected ? 700 : 500}>
                  {level.score}
                </Typography>
              </Stack>
            </ButtonBase>
          );
        },
      })),
      {
        id: 'comments',
        label: 'Criterion Feedback',
        minWidth: 230,
        width: '30%',
        isSort: false,
        isFilter: false,
        headerSx: { verticalAlign: 'bottom', pb: 1 },
        render: (_value, criterion) => (
          <TextField
            fullWidth
            size="small"
            disabled={readOnly}
            label={`${criterion.title} feedback`}
            value={values[criterion.id]?.comments ?? ''}
            onChange={(event) => onCommentsChange(criterion.id, event.target.value)}
            placeholder="Add focused feedback"
            multiline
            minRows={1}
            maxRows={3}
          />
        ),
      },
    ],
    [levels, onCommentsChange, onMarksChange, readOnly, values]
  );

  return (
    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
      <CustomizableTable
        tableId="rubric-performance-scoring"
        tableTitle="Rubric performance scoring"
        columns={columns}
        data={rubric.criteria}
        isSearch={false}
        isFilter={false}
        isPagination={false}
        isShowedDense={false}
        wrapperProps={{ sx: { minHeight: 'auto' } }}
        tableContainerProps={{ sx: { maxHeight: 420 } }}
      />
    </Box>
  );
};

export default RubricPerformanceMatrix;
