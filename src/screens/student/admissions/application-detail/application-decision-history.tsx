import type { AdmissionApplicationDecisionHistory } from 'src/redux/student/admissions/admission-applications-api';

import { Alert, Stack, Button, Skeleton, Typography } from '@mui/material';

import { getAdmissionApplicationStatusLabel } from '../application-status';
import { formatWorkflowDateTime } from '../workflow-list/workflow-list-format';

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
  if (isLoading) return <Skeleton variant="rounded" height={40} sx={{ mt: 2 }} />;

  if (isError) {
    return (
      <Alert
        severity="error"
        sx={{ mt: 2 }}
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        Decision history could not be loaded.
      </Alert>
    );
  }

  if (!data?.length) return null;

  return (
    <Stack spacing={0.75} sx={{ mt: compact ? 0 : 2, overflowWrap: 'anywhere' }}>
      {!compact && <Typography variant="subtitle2">Decision history</Typography>}
      {data.slice(0, 5).map((item) => (
        <Typography key={item.id} variant="caption" color="text.secondary">
          {getAdmissionApplicationStatusLabel(item.status)} ·{' '}
          {formatWorkflowDateTime(item.occurredAt)}
          {item.reason ? ` · ${item.reason}` : ''}
        </Typography>
      ))}
    </Stack>
  );
}
