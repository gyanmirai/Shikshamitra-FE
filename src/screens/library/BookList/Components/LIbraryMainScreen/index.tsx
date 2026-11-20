import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Card, Alert, Stack, Button, LinearProgress, TablePagination } from '@mui/material';

import { useCatalogPage } from './useCatalogPage';
import { CatalogControls } from './CatalogControls';
import { CatalogResults, CatalogSkeleton } from './CatalogResults';

import type { LibrarySearchProps } from './ListView';

const LibraryMainScreen = (actions: LibrarySearchProps) => {
  const { academicYearId, criteria, update, currentData, isFetching, isError, error, refetch } =
    useCatalogPage();
  const books = currentData?.items || [];
  const totalCount = currentData?.totalCount || 0;
  const filtered = Boolean(criteria.search.trim() || criteria.alphabet !== 'ALL');
  const clear = () => update({ search: '', alphabet: 'ALL', page: 1 });

  return (
    <Card sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <CatalogControls {...criteria} update={update} />
      {isFetching && <LinearProgress aria-label="Refreshing books" />}
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        {!academicYearId ? (
          <Alert severity="info">Select an academic year to load the catalog.</Alert>
        ) : isFetching && !currentData ? (
          <CatalogSkeleton />
        ) : isError ? (
          <Alert
            severity="error"
            sx={{ m: 1 }}
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            {parseApiProblemDetail(error).detail || 'Could not load the catalog.'}
          </Alert>
        ) : books.length ? (
          <CatalogResults books={books} view={criteria.view} {...actions} />
        ) : (
          <Stack spacing={1} alignItems="center" sx={{ p: 3 }}>
            <EmptyContent
              title={
                filtered
                  ? 'No books match your search'
                  : criteria.page > 1
                    ? 'No books on this page'
                    : 'No books in the catalog'
              }
            />
            {filtered && (
              <Button size="small" variant="outlined" color="inherit" onClick={clear}>
                Clear filters
              </Button>
            )}
            {criteria.page > 1 && (
              <Button size="small" onClick={() => update({ page: 1 })}>
                Go to first page
              </Button>
            )}
          </Stack>
        )}
      </Scrollbar>
      <Box sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider', overflowX: 'auto' }}>
        <TablePagination
          component="div"
          count={totalCount}
          page={criteria.page - 1}
          rowsPerPage={criteria.pageSize}
          rowsPerPageOptions={[10, 25, 50]}
          disabled={!academicYearId || isFetching || isError}
          onPageChange={(_, page) => update({ page: page + 1 })}
          onRowsPerPageChange={(event) => update({ pageSize: Number(event.target.value), page: 1 })}
          sx={{
            '.MuiTablePagination-toolbar': {
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              minHeight: 40,
            },
          }}
        />
      </Box>
    </Card>
  );
};

export default LibraryMainScreen;
