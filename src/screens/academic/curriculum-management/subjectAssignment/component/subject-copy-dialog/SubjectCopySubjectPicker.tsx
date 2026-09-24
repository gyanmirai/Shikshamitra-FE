import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Skeleton,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
} from '@mui/material';

import { SubjectCopySubjectList } from './SubjectCopySubjectList';

import type { useCopySubjects } from './useCopySubjects';

type Props = {
  sourceClassSelected: boolean;
  subjects: ReturnType<typeof useCopySubjects>;
};

export function SubjectCopySubjectPicker({ sourceClassSelected, subjects }: Props) {
  if (!sourceClassSelected) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:info-circle-outline" width={20} color="text.secondary" />
          <Typography variant="body2" color="text.secondary">
            Select a source class to see its subjects.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (subjects.isLoading) {
    return (
      <Stack spacing={1}>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rounded" height={48} />
        ))}
      </Stack>
    );
  }

  if (subjects.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button size="small" color="inherit" onClick={() => subjects.retry()}>
            Retry
          </Button>
        }
      >
        Subjects could not be loaded.
      </Alert>
    );
  }

  if (subjects.allSubjects.length === 0) {
    return <Alert severity="info">This class has no subjects to copy.</Alert>;
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          value={subjects.subjectSearch}
          onChange={(event) => subjects.setSubjectSearch(event.target.value)}
          placeholder="Search subjects"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:magnifer-linear" width={18} />
              </InputAdornment>
            ),
            endAdornment: subjects.subjectSearch ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="Clear subject search"
                  onClick={() => subjects.setSubjectSearch('')}
                >
                  <Iconify icon="mingcute:close-line" width={16} />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1.5, py: 1, bgcolor: 'background.neutral' }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Checkbox
            size="small"
            checked={subjects.allFilteredSelected}
            indeterminate={subjects.selectedFilteredCount > 0 && !subjects.allFilteredSelected}
            onChange={subjects.toggleAllFiltered}
          />
          <Typography variant="body2" fontWeight={600}>
            Select visible subjects
          </Typography>
        </Stack>
        <Chip
          size="small"
          variant="outlined"
          label={`${subjects.selectedSubjectIds.length} selected`}
          aria-live="polite"
        />
      </Stack>

      <SubjectCopySubjectList
        subjects={subjects.filteredSubjects}
        selectedSubjectIds={subjects.selectedSubjectIds}
        onToggle={subjects.toggleSubject}
      />
    </Paper>
  );
}
