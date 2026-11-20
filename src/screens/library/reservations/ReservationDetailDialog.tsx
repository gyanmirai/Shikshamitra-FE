import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetLibraryReservationQuery } from 'src/redux/library/reservations-api';

import { ReservationEvents } from './ReservationEvents';
import { ReservationDetails } from './ReservationDetails';
import { useReservationAccess } from './useReservationAccess';
import { ReservationLoadState } from './ReservationLoadState';

import type { ReservationActions } from './ReservationRowActions';

export function ReservationDetailDialog({
  reservationId,
  bookTitle,
  onClose,
  onAction,
  locked,
}: {
  reservationId: string;
  bookTitle: string;
  onClose: () => void;
  locked: boolean;
} & Pick<ReservationActions, 'onAction'>) {
  const { canRead, canWrite, academicYearId } = useReservationAccess();
  const query = useGetLibraryReservationQuery(
    { reservationId, academicYearId },
    { skip: !canRead || !academicYearId, refetchOnMountOrArgChange: true }
  );
  const item = query.currentData;
  return (
    <CustomDialog
      open
      title={`Reservation — ${bookTitle}`}
      titleInfo="Saved request, assigned copy and immutable history for the selected academic year."
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      disableClose={locked}
      handleClose={onClose}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <ReservationLoadState
            fetching={query.isFetching}
            initial={!item}
            error={query.error}
            onRetry={() => query.refetch()}
          />
          {item && (
            <>
              <ReservationDetails item={item} />
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {canWrite && item.canReview && (
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    color="inherit"
                    disabled={locked}
                    startIcon={<Iconify icon={GlobalIcons.edit} />}
                    onClick={() => onAction(item, 'review')}
                  >
                    Review request
                  </Button>
                )}
                {canWrite && item.canCancel && (
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    color="inherit"
                    disabled={locked}
                    startIcon={<Iconify icon={GlobalIcons.cancel} />}
                    onClick={() => onAction(item, 'cancel')}
                  >
                    Cancel request
                  </Button>
                )}
              </Stack>
              <ReservationEvents
                key={`${reservationId}:${academicYearId}`}
                reservationId={reservationId}
                academicYearId={academicYearId}
                enabled={canRead}
              />
            </>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          disabled={locked}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
