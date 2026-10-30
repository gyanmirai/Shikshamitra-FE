import { EmptyContent } from 'src/components/empty-content';
import { Box, Alert, Button, Skeleton } from '@mui/material';

import type { useAcademicInsights } from '../use-academic-insights';

export function AcademicInsightsRequestState({ query, onRetry }: {
  query: ReturnType<typeof useAcademicInsights>; onRetry: () => void;
}) {
  const loading = query.hasContext && (!query.permissionsInitialized ||
    (query.authorized && !query.data && query.isFetching));
  return <>
    {!query.hasContext && <EmptyContent title="Select academic context"
      description="Choose an academic year, board and medium using the global academic selector."
      sx={{ minHeight: 320 }} />}
    {query.hasContext && query.permissionsInitialized && !query.authorized &&
      <EmptyContent title="Academic dashboard access is unavailable"
        description="Your current account does not have permission to view this dashboard."
        sx={{ minHeight: 320 }} />}
    {loading && <Box role="status" aria-label="Loading academic insights" sx={{ display: 'grid', gap: 2,
      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
      {['overview', 'teaching', 'operations', 'assessment'].map((key) =>
        <Skeleton key={key} variant="rounded" height={300} />)}
    </Box>}
    {query.isError && <Alert severity="error" action={<Button size="small" color="inherit" onClick={onRetry}>Retry</Button>}>
      Academic insights could not be loaded. Your academic context has been preserved.
    </Alert>}
  </>;
}
