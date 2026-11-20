import { Box, Alert, Button } from '@mui/material';

import { LoanTable } from '../../circulation/LoanTable';
import { LoanReadFilters } from '../../circulation/LoanReadFilters';
import { useIssueReturnPage } from '../../circulation/useIssueReturnPage';

import type { LibraryLoanRow } from '../../circulation/loan-types';

export default function BookIssueReturnTable({
  onReturnBook,
  onRenewBook,
  onReviewDates,
}: {
  onReturnBook?: (row: LibraryLoanRow) => void;
  onRenewBook?: (row: LibraryLoanRow) => void;
  onReviewDates?: (row: LibraryLoanRow) => void;
}) {
  const query = useIssueReturnPage();
  if (!query.canView)
    return <Alert severity="info">You do not have permission to view borrowing records.</Alert>;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <LoanReadFilters
        academicYearId={query.academicYearId}
        asOfDate={query.requestedAsOfDate}
        onApply={query.onFilters}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {query.invalidAsOf ? (
          <Alert
            severity="warning"
            action={
              <Button size="small" onClick={() => query.onFilters(query.academicYearId, '')}>
                Clear as-of date
              </Button>
            }
          >
            Choose a valid school as-of date or clear it. No classification request has been made
            for the invalid date.
          </Alert>
        ) : (
          <LoanTable
            id="library-circulation-records"
            title="Issue & Return"
            rows={query.currentData?.items || []}
            page={query.page}
            pageSize={query.pageSize}
            totalCount={query.currentData?.totalCount || 0}
            loading={query.isFetching && !query.currentData}
            refreshing={query.isFetching && Boolean(query.currentData)}
            error={query.error}
            onRetry={() => query.refetch()}
            onPage={query.onPage}
            onReturn={onReturnBook}
            onRenew={onRenewBook}
            onReviewDates={onReviewDates}
            emptyMessage="No borrowing or return records are visible in your scope."
          />
        )}
      </Box>
    </Box>
  );
}
