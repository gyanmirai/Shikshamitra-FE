import { Box, Stack, Typography } from '@mui/material';

type ChartContextItem = {
  label: string;
  value: string;
};

export function ChartContextSummary({ items }: { items: ChartContextItem[] }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 0 }}
      sx={{
        mb: 1,
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 0, sm: 1.25 },
            '&:first-of-type': { pl: 0 },
            '&:not(:first-of-type)': {
              borderLeft: { xs: 0, sm: 1 },
              borderColor: 'divider',
            },
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            {item.label}
          </Typography>
          <Typography variant="subtitle2" noWrap title={item.value}>
            {item.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
