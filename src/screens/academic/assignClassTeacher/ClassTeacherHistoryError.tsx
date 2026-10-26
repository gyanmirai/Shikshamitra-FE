import { GlobalIcons } from 'src/utils/icons';
import { Alert, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

type Props = {
  hasHistory: boolean;
  busy: boolean;
  onRetry: () => void;
};

export function ClassTeacherHistoryError({ hasHistory, busy, onRetry }: Props) {
  return (
    <Alert
      severity="error"
      action={
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          disabled={busy}
          startIcon={<Iconify icon={GlobalIcons.refresh} />}
          onClick={onRetry}
        >
          Retry
        </Button>
      }
    >
      {hasHistory
        ? 'Unable to refresh assignment history. Previously loaded history is shown.'
        : 'Unable to load assignment history. Try again.'}
    </Alert>
  );
}
