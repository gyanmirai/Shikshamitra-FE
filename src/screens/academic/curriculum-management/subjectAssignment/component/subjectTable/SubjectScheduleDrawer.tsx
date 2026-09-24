'use client';

import { Scrollbar } from 'src/components/scrollbar';
import { Box, Chip, Alert, Stack, Button, Drawer, Skeleton, Typography } from '@mui/material';
import { useGetSubjectScheduleBreakdownQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { SubjectScheduleSummary } from './SubjectScheduleSummary';
import { SubjectScheduleEmptyState } from './SubjectScheduleEmptyState';
import { SubjectScheduleLectureList } from './SubjectScheduleLectureList';
import { SubjectScheduleDrawerHeader } from './SubjectScheduleDrawerHeader';

type Props = {
  assignmentId?: string;
  subjectLabel: string;
  open: boolean;
  onClose: () => void;
};

function DrawerBody({ assignmentId, open }: Pick<Props, 'assignmentId' | 'open'>) {
  const { data, isLoading, isFetching, isError, refetch } = useGetSubjectScheduleBreakdownQuery(
    { assignmentId: assignmentId || '' },
    { skip: !open || !assignmentId }
  );
  const breakdown = data?.data;

  if (isLoading || (isFetching && !breakdown)) {
    return (
      <Stack spacing={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} variant="rounded" height={118} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={320} />
      </Stack>
    );
  }
  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={refetch}>
            Retry
          </Button>
        }
      >
        The lecture breakdown could not be loaded.
      </Alert>
    );
  }
  if (!breakdown) return null;

  return (
    <Stack spacing={2}>
      <SubjectScheduleSummary data={breakdown} />
      {breakdown.lectures.length ? (
        <Stack spacing={1.5} component="section" aria-labelledby="scheduled-lectures-title">
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Box>
              <Typography id="scheduled-lectures-title" variant="subtitle2">
                Scheduled lectures
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Timetable slots grouped by teaching day
              </Typography>
            </Box>
            <Chip size="small" variant="soft" label={`${breakdown.lectures.length} total`} />
          </Stack>
          <SubjectScheduleLectureList lectures={breakdown.lectures} />
        </Stack>
      ) : (
        <SubjectScheduleEmptyState data={breakdown} />
      )}
    </Stack>
  );
}

export function SubjectScheduleDrawer({ assignmentId, subjectLabel, open, onClose }: Props) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'subject-schedule-title',
        sx: {
          width: { xs: '100%', sm: 600 },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        },
      }}
    >
      <SubjectScheduleDrawerHeader subjectLabel={subjectLabel} onClose={onClose} />

      <Scrollbar sx={{ flex: 1 }}>
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
          <DrawerBody assignmentId={assignmentId} open={open} />
        </Box>
      </Scrollbar>
    </Drawer>
  );
}
