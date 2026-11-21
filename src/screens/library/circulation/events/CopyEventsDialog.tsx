import type { CopyIdentity } from 'src/redux/library/copy-lifecycle-types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { TablePaginationCustom } from 'src/components/table';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Alert,
  Stack,
  Button,
  Skeleton,
  Typography,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import { useCopyEvents } from './useCopyEvents';
import { CopyEventCard } from './CopyEventCard';

export function CopyEventsDialog({
  bookId,
  copyId,
  accessionNumber,
  onClose,
}: CopyIdentity & { accessionNumber: string; onClose: () => void }) {
  const query = useCopyEvents(bookId, copyId);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <CustomDialog
      open
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      handleClose={onClose}
      title={`Copy Events — ${accessionNumber}`}
      titleInfo="Immutable inventory activity for this saved copy, newest first. Borrowing history remains a separate scoped view."
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Newest first · Times shown in {zone} · All recorded copy events
          </Typography>
          {!query.canView ? (
            <Alert severity="info">
              Catalogue view permission is required to view copy events.
            </Alert>
          ) : (
            <>
              {query.isFetching && <LinearProgress aria-label="Loading copy events" />}
              {query.isError && (
                <Alert
                  severity="error"
                  action={
                    <Button size="small" onClick={() => query.refetch()}>
                      Retry
                    </Button>
                  }
                >
                  Could not load copy events. Please retry.
                </Alert>
              )}
              {!query.currentData && query.isFetching && (
                <Skeleton variant="rounded" height={160} />
              )}
              {query.currentData && (
                <Stack
                  component="ol"
                  spacing={2}
                  aria-label="Copy events, newest first"
                  sx={{ listStyle: 'none', p: 0, m: 0 }}
                >
                  {query.currentData.items.map((event) => (
                    <li key={event.id}>
                      <CopyEventCard event={event} />
                    </li>
                  ))}
                </Stack>
              )}
              {!query.isFetching && !query.isError && query.currentData?.totalCount === 0 && (
                <EmptyContent
                  title="No copy events recorded"
                  description="Future condition, notes, location and write-off changes will appear here."
                />
              )}
            </>
          )}
        </Stack>
      </DialogScrollContent>
      {query.canView && (
        <TablePaginationCustom
          count={query.currentData?.totalCount || 0}
          page={query.currentData ? query.page - 1 : 0}
          rowsPerPage={query.pageSize}
          disabled={query.isFetching}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(_, page) => query.onPage(page + 1, query.pageSize)}
          onRowsPerPageChange={(event) => query.onPage(1, Number(event.target.value))}
        />
      )}
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
