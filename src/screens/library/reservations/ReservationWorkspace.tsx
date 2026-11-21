import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useListLibraryReservationsQuery } from 'src/redux/library/reservations-api';

import { ReservationTable } from './ReservationTable';
import { ReservationToolbar } from './ReservationToolbar';
import { useReservationAccess } from './useReservationAccess';
import { ReservationCreateDialog } from './ReservationCreateDialog';
import { ReservationDetailDialog } from './ReservationDetailDialog';
import { ReservationCancelDialog } from './ReservationCancelDialog';
import { ReservationReviewDialog } from './ReservationReviewDialog';

export function ReservationWorkspace({
  book,
  onClose,
}: {
  book: { id: string; title: string };
  onClose: () => void;
}) {
  const { academicYearId, canRead, canWrite } = useReservationAccess();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [includeHistory, setHistory] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [create, setCreate] = useState(false);
  const [action, setAction] = useState<{ id: string; mode: 'cancel' | 'review' } | null>(null);
  const query = useListLibraryReservationsQuery(
    { bookId: book.id, academicYearId, page, pageSize, includeHistory },
    { skip: !canRead || !academicYearId }
  );
  useEffect(() => {
    setPage(1);
    setDetail(null);
    setAction(null);
    setCreate(false);
  }, [academicYearId, book.id]);
  useEffect(() => {
    if (query.currentData && !query.isFetching) {
      const last = Math.max(1, Math.ceil(query.currentData.totalCount / pageSize));
      if (page > last) setPage(last);
    }
  }, [page, pageSize, query.currentData, query.isFetching]);
  const locked = Boolean(detail || action || create);
  const openAction = (item: { id: string }, mode: 'cancel' | 'review') =>
    setAction({ id: item.id, mode });
  return (
    <>
      <CustomDialog
        open
        title={`Reservations — ${book.title}`}
        maxWidth="lg"
        hasForm={false}
        titleInfo="Requests for this book in the selected academic year. Assigned copies and collection deadlines come from the saved server decision."
        guardUnsavedChanges={false}
        disableClose={locked}
        handleClose={onClose}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {!academicYearId && (
              <Alert severity="info">Select an academic year to view requests.</Alert>
            )}
            {!canRead && <Alert severity="info">Catalogue view permission is required.</Alert>}
            {canRead && academicYearId && (
              <>
                <ReservationToolbar
                  includeHistory={includeHistory}
                  onHistory={(value) => {
                    setHistory(value);
                    setPage(1);
                  }}
                  canWrite={canWrite}
                  locked={locked}
                  onCreate={() => setCreate(true)}
                />
                <ReservationTable
                  items={query.currentData?.items || []}
                  totalCount={query.currentData?.totalCount || 0}
                  page={page}
                  pageSize={pageSize}
                  loading={!query.currentData && query.isFetching}
                  refreshing={Boolean(query.currentData && query.isFetching)}
                  error={query.error}
                  onRetry={() => query.refetch()}
                  onPage={(next, size) => {
                    setPage(next);
                    setPageSize(size);
                  }}
                  canWrite={canWrite && !locked}
                  onView={(item) => setDetail(item.id)}
                  onAction={openAction}
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
      {detail && (
        <ReservationDetailDialog
          key={`${detail}:${academicYearId}`}
          reservationId={detail}
          bookTitle={book.title}
          locked={Boolean(action)}
          onClose={() => setDetail(null)}
          onAction={openAction}
        />
      )}
      {create && <ReservationCreateDialog book={book} onClose={() => setCreate(false)} />}
      {action?.mode === 'cancel' && (
        <ReservationCancelDialog
          key={`${action.id}:${academicYearId}`}
          reservationId={action.id}
          onClose={() => setAction(null)}
        />
      )}
      {action?.mode === 'review' && (
        <ReservationReviewDialog
          key={`${action.id}:${academicYearId}`}
          reservationId={action.id}
          onClose={() => setAction(null)}
        />
      )}
    </>
  );
}
