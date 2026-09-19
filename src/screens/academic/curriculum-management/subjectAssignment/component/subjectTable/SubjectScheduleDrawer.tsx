'use client';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Alert, Stack, Button, Drawer, Skeleton, IconButton, Typography } from '@mui/material';
import { useGetSubjectScheduleBreakdownQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { SubjectScheduleSummary } from './SubjectScheduleSummary';
import { SubjectScheduleLectureList } from './SubjectScheduleLectureList';

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
      <Stack spacing={1.5}>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rounded" height={112} />
        ))}
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
        <SubjectScheduleLectureList lectures={breakdown.lectures} />
      ) : (
        <Stack alignItems="center" spacing={1} sx={{ py: 7, textAlign: 'center' }}>
          <Iconify icon="mdi:calendar-remove-outline" width={48} color="text.disabled" />
          <Typography variant="subtitle1" fontWeight={700}>
            No lectures scheduled yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>
            This subject has an allocation target, but no matching timetable slots have been saved.
          </Typography>
        </Stack>
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
        sx: { width: { xs: '100%', sm: 560 }, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>
            Weekly lecture breakdown
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {subjectLabel}
          </Typography>
        </Box>
        <IconButton aria-label="Close lecture breakdown" onClick={onClose}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Box>

      <Scrollbar sx={{ flex: 1, '& .simplebar-content': { p: 2 } }}>
        <DrawerBody assignmentId={assignmentId} open={open} />
      </Scrollbar>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'right' }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Box>
    </Drawer>
  );
}
