import { Box, Stack, Button, Typography } from '@mui/material';

import type { QuickSubstitutionLecture } from './types';

type Props = {
  lectures: QuickSubstitutionLecture[];
  selectedKey: string;
  disabled: boolean;
  onSelect: (lecture: QuickSubstitutionLecture) => void;
};

export function QuickSubstitutionLectures({ lectures, selectedKey, disabled, onSelect }: Props) {
  return (
    <Stack spacing={1} aria-label="Affected periods">
      {lectures.map((lecture) => (
        <Box key={lecture.key} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
            <Box>
              <Typography variant="subtitle2">
                {lecture.period} · {lecture.startTime}–{lecture.endTime}
              </Typography>
              <Typography variant="body2">
                Class {lecture.className}-{lecture.divisionName} · {lecture.subjectName}
              </Typography>
              {!lecture.canCreateSubstitution && (
                <Typography variant="caption" color="text.secondary">
                  {lecture.createSubstitutionBlockReason}
                  {lecture.existingSubstitutionStatus
                    ? ` · ${lecture.existingSubstitutionStatus}`
                    : ''}
                </Typography>
              )}
            </Box>
            <Button
              size="small"
              sx={{ minHeight: 44, flexShrink: 0 }}
              variant={selectedKey === lecture.key ? 'contained' : 'outlined'}
              disabled={disabled || !lecture.canCreateSubstitution}
              onClick={() => onSelect(lecture)}
              aria-label={`Arrange ${lecture.period} for Class ${lecture.className}-${lecture.divisionName}`}
            >
              {selectedKey === lecture.key ? 'Selected' : 'Arrange'}
            </Button>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
