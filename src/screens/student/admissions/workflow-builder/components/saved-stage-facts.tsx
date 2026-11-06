import { Box, Typography } from '@mui/material';

export function SavedStageFacts({
  items,
}: {
  items: [string, string | number | null | undefined][];
}) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      {items.map(([label, value]) => (
        <Box key={label} sx={{ minWidth: 0 }}>
          <Typography component="dt" variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography
            component="dd"
            variant="body2"
            sx={{ m: 0, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
          >
            {value === null || value === undefined || value === '' ? '—' : value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
