import type { AdmissionApplicationDecisionHistory } from 'src/redux/student/admissions/admission-applications-api';

import { Label } from 'src/components/label';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Skeleton, Typography } from '@mui/material';

import { formatWorkflowDateTime } from '../workflow-list/workflow-list-format';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';

type Props = {
  isLoading: boolean;
  isError: boolean;
  data?: AdmissionApplicationDecisionHistory[];
  onRetry: () => void;
  compact?: boolean;
};

export function ApplicationDecisionHistory({
  isLoading,
  isError,
  data,
  onRetry,
  compact = false,
}: Props) {
  if (isLoading) return <Skeleton variant="rounded" height={40} sx={{ mt: compact ? 0 : 2 }} />;

  if (isError) {
    return (
      <StudentFeedback
        notificationKey="STU-0189"
        presentation="toast"
        severity="error"
        sx={{ mt: compact ? 0 : 2 }}
        toastAction={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        Decision history could not be loaded.
      </StudentFeedback>
    );
  }

  if (!data?.length)
    return (
      <Typography variant="body2" color="text.secondary">
        No decision recorded yet.
      </Typography>
    );

  return (
    <Stack spacing={1.5} sx={{ mt: compact ? 0 : 2, minWidth: 0, overflowWrap: 'anywhere' }}>
      {!compact && <Typography variant="subtitle2">Decision History</Typography>}
      <Stack
        component="ol"
        spacing={1.5}
        sx={{ p: 0, m: 0, listStyle: 'none' }}
        aria-label="Recorded decisions"
      >
        {data.slice(0, 5).map((item) => (
          <Stack
            component="li"
            key={item.id}
            spacing={0.5}
            sx={{
              minWidth: 0,
              '&:not(:last-child)': { pb: 1.5, borderBottom: 1, borderColor: 'divider' },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              useFlexGap
              flexWrap="wrap"
            >
              <Label color={getAdmissionApplicationStatusColor(item.status)}>
                {getAdmissionApplicationStatusLabel(item.status)}
              </Label>
              <Typography
                component="time"
                dateTime={item.occurredAt}
                variant="caption"
                color="text.secondary"
              >
                {formatWorkflowDateTime(item.occurredAt)}
              </Typography>
            </Stack>
            {item.actorName && (
              <Typography variant="caption" color="text.secondary">
                Recorded by {item.actorName}
              </Typography>
            )}
            {item.reason && (
              <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                {item.reason}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
