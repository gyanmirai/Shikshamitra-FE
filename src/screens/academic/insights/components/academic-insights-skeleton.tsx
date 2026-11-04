import { Box, Card, Stack, Skeleton } from '@mui/material';

type Preview = 'mapping' | 'progress' | 'timetable' | 'list';

function SectionPreview({ kind }: { kind: Preview }) {
  if (kind === 'mapping') return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, py: 1 }}>
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={52} />
      ))}
    </Box>
  );
  if (kind === 'timetable') return (
    <Stack direction="row" spacing={2} sx={{ py: 1 }}>
      <Stack spacing={1} justifyContent="center" sx={{ width: '25%' }}>
        <Skeleton width="65%" height={30} />
        <Skeleton height={16} />
        <Skeleton width="65%" height={30} />
        <Skeleton height={16} />
      </Stack>
      <Stack direction="row" spacing={1} alignItems="flex-end"
        sx={{ flex: 1, minWidth: 0, height: 150, borderBottom: '1px solid', borderColor: 'divider' }}>
        {[82, 110, 96, 130, 104].map((height) => (
          <Skeleton key={height} variant="rounded" height={height} sx={{ flex: 1 }} />
        ))}
      </Stack>
    </Stack>
  );
  return (
    <Stack spacing={1.5} sx={{ py: 1 }}>
      {[80, 60, 72].map((width) => (
        <Stack key={width} spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" gap={2}>
            <Skeleton width={`${width}%`} height={18} />
            <Skeleton width={32} height={18} />
          </Stack>
          {kind === 'progress' && <Skeleton variant="rounded" height={8} width={`${width}%`} />}
          {kind === 'list' && <Skeleton width="48%" height={14} />}
        </Stack>
      ))}
    </Stack>
  );
}

export function AcademicInsightsSkeleton() {
  return (
    <Stack role="status" aria-label="Loading academic insights" aria-busy spacing={1}
      sx={{ minWidth: 0, '@media (prefers-reduced-motion: reduce)': {
        '& .MuiSkeleton-root, & .MuiSkeleton-root::after': { animation: 'none' },
      } }}>
      <Box aria-hidden sx={{ display: 'grid', gap: 1,
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' } }}>
        {[0, 1, 2, 3].map((key) => (
          <Card key={key} variant="outlined" sx={{ p: 1.5, minWidth: 0, minHeight: 122, borderRadius: 1,
            boxShadow: 'none', display: 'flex', gap: 1.5 }}>
            <Skeleton variant="rounded" width={30} height={30}
              sx={{ mt: 0.75, flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
            <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton width="80%" height={18} />
              <Skeleton width="55%" height={36} />
              <Skeleton width="95%" height={18} />
            </Stack>
          </Card>
        ))}
      </Box>
      <Box aria-hidden sx={{ display: 'grid', gap: 1, alignItems: 'start',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' } }}>
        {(['mapping', 'progress', 'timetable', 'list'] as const).map((kind) => (
          <Card key={kind} variant="outlined" sx={{ p: 2, minWidth: 0, borderRadius: 1, boxShadow: 'none' }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="rounded" width={24} height={24} />
                <Skeleton width="55%" height={24} />
                <Skeleton variant="circular" width={16} height={16} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Skeleton width="35%" height={20} />
                <Skeleton width="25%" height={20} />
              </Stack>
              <SectionPreview kind={kind} />
              <Stack direction="row" spacing={1} sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Skeleton variant="rounded" width="38%" height={28} />
                <Skeleton variant="rounded" width="30%" height={28} />
              </Stack>
            </Stack>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
