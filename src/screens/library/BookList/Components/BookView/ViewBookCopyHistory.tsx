import type { IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Button, DialogActions } from '@mui/material';
import { DialogScrollContent } from 'src/components/customDialog';

import { LoanTable } from '../../../circulation/LoanTable';
import { useCopyHistory } from '../../../circulation/useCopyHistory';
import { LoanReadFilters } from '../../../circulation/LoanReadFilters';

export default function ViewBookCopyHistoryTable({
  editData,
  onClose,
}: {
  editData: IBookCopyWithBook | null;
  onClose: () => void;
}) {
  const bookId = editData?.bookId || editData?.book.id || '';
  const copyId = editData?.copyId || editData?.id || '';
  const query = useCopyHistory(bookId, copyId);
  return (
    <>
      <DialogScrollContent>
        {!query.canView ? (
          <Alert severity="info">You do not have permission to view borrowing history.</Alert>
        ) : !bookId || !copyId ? (
          <Alert severity="info">Select a saved book copy to view its borrowing history.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <LoanReadFilters
              academicYearId={query.academicYearId}
              asOfDate={query.requestedAsOfDate}
              onApply={query.onFilters}
            />
            {query.invalidAsOf ? (
              <Alert
                severity="warning"
                action={
                  <Button size="small" onClick={() => query.onFilters(query.academicYearId, '')}>
                    Clear as-of date
                  </Button>
                }
              >
                Choose a valid school as-of date or clear it.
              </Alert>
            ) : (
              <LoanTable
                id="library-copy-borrowing-history"
                title="Copy Borrowing History"
                rows={query.currentData?.items || []}
                page={query.page}
                pageSize={query.pageSize}
                totalCount={query.currentData?.totalCount || 0}
                loading={query.isFetching && !query.currentData}
                refreshing={query.isFetching && Boolean(query.currentData)}
                error={query.error}
                onRetry={() => query.refetch()}
                onPage={query.onPage}
                emptyMessage="This copy has no borrowing history in your scope."
              />
            )}
          </Box>
        )}
      </DialogScrollContent>
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
    </>
  );
}
