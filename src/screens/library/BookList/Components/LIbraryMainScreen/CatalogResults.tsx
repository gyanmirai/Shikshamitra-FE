import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import { Box, Grid, Skeleton } from '@mui/material';

import ListView from './ListView';
import CoverView from './CoverView';
import SummaryView from './SummaryView';

import type { CatalogView } from './catalog-query';
import type { LibrarySearchProps } from './ListView';

export function CatalogSkeleton() {
  return (
    <Grid container spacing={2} sx={{ p: 2 }} aria-label="Loading books">
      {[1, 2, 3].map((key) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
          <Skeleton width="80%" />
          <Skeleton width="50%" />
        </Grid>
      ))}
    </Grid>
  );
}

export function CatalogResults({
  view,
  books,
  ...actions
}: LibrarySearchProps & { view: CatalogView; books: IBook[] }) {
  const View = view === 'cover' ? CoverView : view === 'summary' ? SummaryView : ListView;
  return (
    <Box sx={{ minWidth: 0 }}>
      <View books={books} {...actions} />
    </Box>
  );
}
