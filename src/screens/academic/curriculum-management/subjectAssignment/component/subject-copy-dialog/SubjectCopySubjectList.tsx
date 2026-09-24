import { Box, Stack, Paper, Checkbox, Typography } from '@mui/material';

import type { CopySubjectItem } from './types';

type Props = {
  subjects: CopySubjectItem[];
  selectedSubjectIds: string[];
  onToggle: (id: string) => void;
};

export function SubjectCopySubjectList({ subjects, selectedSubjectIds, onToggle }: Props) {
  if (subjects.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
        No subjects match your search.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.75} sx={{ p: 1, maxHeight: 220, overflowY: 'auto' }}>
      {subjects.map((subject) => {
        const selected = selectedSubjectIds.includes(subject.id);
        return (
          <Paper
            key={subject.id}
            component="label"
            variant="outlined"
            sx={{
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              borderRadius: 1.5,
              borderColor: selected ? 'text.primary' : 'divider',
              bgcolor: selected ? 'action.selected' : 'background.paper',
            }}
          >
            <Checkbox size="small" checked={selected} onChange={() => onToggle(subject.id)} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {subject.name}
              </Typography>
              {subject.code && (
                <Typography variant="caption" color="text.secondary">
                  {subject.code}
                </Typography>
              )}
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}
