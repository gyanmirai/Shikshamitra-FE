import { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { TablePaginationCustom } from 'src/components/table';
import { useGetLibraryReservationEventsQuery } from 'src/redux/library/reservations-api';

import { ReservationLoadState } from './ReservationLoadState';
import { ReservationEventCard } from './ReservationEventCard';

export function ReservationEvents({
  reservationId,
  academicYearId,
  enabled,
}: {
  reservationId: string;
  academicYearId: string;
  enabled: boolean;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useGetLibraryReservationEventsQuery(
    { reservationId, academicYearId, page, pageSize },
    { skip: !enabled || !academicYearId }
  );
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">Reservation Events</Typography>
      <Typography variant="body2" color="text.secondary">
        Recorded order · Times shown in {zone}
      </Typography>
      <ReservationLoadState
        fetching={query.isFetching}
        initial={!query.currentData}
        error={query.error}
        onRetry={() => query.refetch()}
        empty={query.currentData?.totalCount === 0}
      />
      <Stack
        component="ol"
        spacing={2}
        aria-label="Reservation events"
        sx={{ listStyle: 'none', p: 0, m: 0 }}
      >
        {query.currentData?.items.map((event) => (
          <li key={event.id}>
            <ReservationEventCard event={event} />
          </li>
        ))}
      </Stack>
      <TablePaginationCustom
        count={query.currentData?.totalCount || 0}
        page={page - 1}
        rowsPerPage={pageSize}
        disabled={query.isFetching}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_, value) => setPage(value + 1)}
        onRowsPerPageChange={(event) => {
          setPage(1);
          setPageSize(Number(event.target.value));
        }}
      />
    </Stack>
  );
}
