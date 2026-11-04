import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, Typography, LinearProgress } from '@mui/material';
import { useGetClassTeacherAssignmentHistoryQuery } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import { AssignmentDrawerShell } from './AssignmentDrawerShell';
import { ClassTeacherHistoryError } from './ClassTeacherHistoryError';
import { ClassTeacherHistorySkeleton } from './ClassTeacherHistorySkeleton';

type Props = { open: boolean; organization: string; canView: boolean; onClose: () => void };

export function ClassTeacherHistoryDrawer({ open, organization, canView, onClose }: Props) {
  const {
    currentData: history = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetClassTeacherAssignmentHistoryQuery(
    { organizationId: organization },
    { skip: !canView || !organization || !open }
  );
  return (
    <AssignmentDrawerShell
      open={open}
      title="Assignment History"
      onClose={onClose}
      help="Review saved teacher changes, reasons, and audit dates for the selected organization."
      actions={
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      }
    >
      <Stack spacing={2} aria-busy={isLoading || isFetching}>
        {isError && (
          <ClassTeacherHistoryError
            hasHistory={history.length > 0}
            busy={isFetching}
            onRetry={() => refetch()}
          />
        )}
        {isLoading || (isFetching && !history.length) ? (
          <ClassTeacherHistorySkeleton />
        ) : !history.length ? (
          !isError && <EmptyContent title="No assignment history found." />
        ) : (
          <FormSectionCard
            title="Assignment Changes"
            icon={GlobalIcons.history}
            titleTypographyProps={{ component: 'h3' }}
            descriptionTooltip="Saved teacher assignments with the recorded change reason, date, and user."
          >
            {isFetching && <LinearProgress aria-label="Refreshing assignment history" />}
            {history.map((item) => (
              <Box
                key={`${item.classId}-${item.divisionId}-${item.changedAt}`}
                sx={{
                  '& + &': { pt: 2, borderTop: 1, borderColor: 'divider' },
                  overflowWrap: 'anywhere',
                }}
              >
                  <Typography component="p" variant="subtitle2">
                  {item.className} {item.divisionName}
                </Typography>
                <Typography variant="body2">
                  {item.newTeacherName || 'Teacher not available'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Changed on:{' '}
                  {dayjs(item.changedAt).isValid()
                    ? dayjs(item.changedAt).format('DD/MM/YYYY')
                    : 'Not available'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Change reason: {item.changeReason || 'Not recorded'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Changed by: {item.changedBy || 'System'}
                </Typography>
              </Box>
            ))}
          </FormSectionCard>
        )}
      </Stack>
    </AssignmentDrawerShell>
  );
}
