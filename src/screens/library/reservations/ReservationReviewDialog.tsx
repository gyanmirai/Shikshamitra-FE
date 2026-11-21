import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useReservationAccess } from './useReservationAccess';
import { ReservationLoadState } from './ReservationLoadState';
import { useReservationSession } from './useReservationSession';
import { ReservationReviewEditor } from './ReservationReviewEditor';

export function ReservationReviewDialog({
  reservationId,
  onClose,
}: {
  reservationId: string;
  onClose: () => void;
}) {
  const { academicYearId, canWrite } = useReservationAccess();
  const { snapshot, query, retry } = useReservationSession(reservationId, academicYearId, canWrite);
  if (snapshot?.canReview) return <ReservationReviewEditor snapshot={snapshot} onClose={onClose} />;
  return (
    <CustomDialog
      open
      title="Review Reservation"
      maxWidth="sm"
      titleInfo="Review requires current server authority for this stored request."
      hasForm={false}
      guardUnsavedChanges={false}
      handleClose={onClose}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {!canWrite && (
            <Alert severity="info">Catalogue view and Reserve permissions are required.</Alert>
          )}
          <ReservationLoadState
            fetching={query.isFetching}
            initial={!snapshot}
            error={query.error}
            onRetry={retry}
          />
          {snapshot && (
            <Alert severity="warning">
              The server does not allow review of this request in your current scope.
            </Alert>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
