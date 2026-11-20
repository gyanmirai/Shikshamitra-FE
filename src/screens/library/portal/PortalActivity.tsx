import type { PortalLoan, PortalReservation } from 'src/redux/library/library-portal-api';

import { useState } from 'react';
import { formatDateOnly } from 'src/utils/date-only';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Paper, Button, Typography } from '@mui/material';
import {
  usePortalLibraryLoansQuery,
  usePortalLibraryReservationsQuery,
  useCancelPortalReservationMutation,
} from 'src/redux/library/library-portal-api';

import PortalRenewDialog from './PortalRenewDialog';
import { portalPageSize, PortalPageStatus, PortalPageControls } from './PortalPageControls';

const date = (value: string | null) => (value ? formatDateOnly(value) : 'Unconfirmed');
const reservationStates = [
  'Waiting',
  'Ready for pickup',
  'Collected',
  'Cancelled',
  'Expired',
  'Needs review',
];

export function PortalLoans({ studentId }: { studentId: string }) {
  const [page, setPage] = useState(1);
  const [loan, changeLoan] = useState<PortalLoan | null>(null);
  const query = usePortalLibraryLoansQuery(
    { studentId, page, pageSize: portalPageSize },
    { refetchOnMountOrArgChange: true }
  );
  const data = query.isError ? undefined : query.currentData;
  return (
    <>
      <PortalPageStatus busy={query.isFetching} error={query.isError} retry={query.refetch} />
      {data && !data.items.length && (
        <Typography variant="body2">No loans have been recorded.</Typography>
      )}
      {data?.items.map((item) => (
        <Paper key={item.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">{item.title ?? 'Title unavailable'}</Typography>
              <Typography variant="body2">{item.accession}</Typography>
              <Typography variant="body2">
                {item.isOpen ? `Due ${date(item.dueOn)}` : `Returned ${date(item.returnedOn)}`}
              </Typography>
            </Stack>
            {item.canPreviewRenewal && (
              <Button size="small" onClick={() => changeLoan(item)}>
                Review renewal
              </Button>
            )}
          </Stack>
        </Paper>
      ))}
      <PortalPageControls data={data} setPage={setPage} />
      {loan && (
        <PortalRenewDialog
          key={loan.id}
          studentId={studentId}
          loan={loan}
          onClose={() => changeLoan(null)}
        />
      )}
    </>
  );
}

export function PortalRequests({ studentId }: { studentId: string }) {
  const [page, setPage] = useState(1);
  const [chosen, choose] = useState<PortalReservation | null>(null);
  const [error, setError] = useState('');
  const [cancel, result] = useCancelPortalReservationMutation();
  const query = usePortalLibraryReservationsQuery(
    { studentId, page, pageSize: portalPageSize },
    { refetchOnMountOrArgChange: true }
  );
  const data = query.isError ? undefined : query.currentData;
  const confirm = async () => {
    if (!chosen || result.isLoading) return;
    setError('');
    try {
      await cancel({ studentId, id: chosen.id, revision: chosen.revision }).unwrap();
      choose(null);
    } catch (problem) {
      setError(
        parseApiProblemDetail(problem).detail ||
          'Could not confirm cancellation. Review the current reservation.'
      );
      choose(null);
      query.refetch();
    }
  };
  return (
    <>
      <PortalPageStatus busy={query.isFetching} error={query.isError} retry={query.refetch} />
      {error && <Alert severity="error">{error}</Alert>}
      {data && !data.items.length && (
        <Typography variant="body2">No reservation requests have been recorded.</Typography>
      )}
      {data?.items.map((item) => (
        <Paper key={item.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">{item.title ?? 'Title unavailable'}</Typography>
              <Typography variant="body2">
                {reservationStates[item.state] ?? 'Status unavailable'}
              </Typography>
              {item.pickupLocation && (
                <Typography variant="body2">{item.pickupLocation}</Typography>
              )}
              {item.pickupBefore && (
                <Typography variant="body2">Pickup by {date(item.pickupBefore)}</Typography>
              )}
            </Stack>
            {item.canCancel && (
              <Button size="small" onClick={() => choose(item)}>
                Cancel reservation
              </Button>
            )}
          </Stack>
        </Paper>
      ))}
      <PortalPageControls data={data} setPage={setPage} />
      <ConfirmDialog
        open={Boolean(chosen)}
        onClose={() => {
          if (!result.isLoading) choose(null);
        }}
        title="Cancel reservation?"
        content={chosen?.title}
        action={
          <Button color="error" variant="contained" disabled={result.isLoading} onClick={confirm}>
            Cancel reservation
          </Button>
        }
      />
    </>
  );
}
