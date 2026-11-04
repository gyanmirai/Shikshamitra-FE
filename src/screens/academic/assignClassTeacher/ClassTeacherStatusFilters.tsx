import type { LabelColor } from 'src/components/label';
import type { ClassTeacherSummary } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import { Label } from 'src/components/label';
import { Box, Stack, ButtonBase, Typography } from '@mui/material';

type Props = {
  summary: ClassTeacherSummary;
  value: string;
  known: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
};

export function ClassTeacherStatusFilters({ summary, value, known, disabled, onChange }: Props) {
  const choices: { value: string; label: string; count: number; color: LabelColor }[] = [
    { value: 'all', label: 'All', count: summary.totalClasses, color: 'default' },
    { value: 'assigned', label: 'Assigned', count: summary.assigned, color: 'success' },
    { value: 'unassigned', label: 'Unassigned', count: summary.unassigned, color: 'warning' },
    { value: 'conflict', label: 'Conflicts', count: summary.conflicts, color: 'error' },
    { value: 'changed', label: 'Pending changes', count: summary.pendingChanges, color: 'info' },
    { value: 'temporary', label: 'Temporary', count: summary.temporaryAssignments, color: 'info' },
  ];
  return (
    <Box
      role="group"
      aria-label="Assignment status filters"
      sx={{
        px: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        flexShrink: 0,
        minWidth: 0,
        overflowX: 'auto',
      }}
    >
      <Stack direction="row" gap={2} sx={{ width: 'max-content', minWidth: '100%' }}>
        {choices.map((choice) => (
          <ButtonBase
            key={choice.value}
            disabled={disabled}
            aria-pressed={value === choice.value}
            onClick={() => onChange(choice.value)}
            sx={{
              minHeight: 44,
              gap: 1,
              borderBottom: 2,
              borderColor: value === choice.value ? 'text.primary' : 'transparent',
              color: value === choice.value ? 'text.primary' : 'text.secondary',
              '&.Mui-focusVisible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: -2,
              },
            }}
          >
            <Typography component="span" variant="subtitle2">
              {choice.label}
            </Typography>
            <Label color={choice.color} variant={value === choice.value ? 'filled' : 'soft'}>
              {known ? choice.count : '…'}
            </Label>
          </ButtonBase>
        ))}
      </Stack>
    </Box>
  );
}
