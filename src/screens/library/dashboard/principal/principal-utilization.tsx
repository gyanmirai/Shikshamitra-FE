import React from 'react';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { useTheme, type PaletteColor } from '@mui/material/styles';
import { Box, Card, Stack, Divider, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type ColorType = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

const MetricItem = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: ColorType;
}) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={2}
    sx={{ width: '100%', justifyContent: 'center' }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: (theme) => (theme.palette[color] as PaletteColor).main,
      }}
    >
      <Iconify icon={icon} width={24} />
    </Box>
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Box>
  </Stack>
);

export default function PrincipalUtilization() {
  const theme = useTheme();

  return (
    <Card
      sx={{
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        sx={{ py: 1 }}
      >
        <MetricItem
          label="High Demand Categories"
          value={fNumber(12)}
          icon="solar:fire-linear"
          color="error"
        />

        <MetricItem
          label="Low Utilization"
          value={fNumber(5)}
          icon="solar:leaf-linear"
          color="success"
        />

        <MetricItem
          label="Overdue Books"
          value={fNumber(45)}
          icon="solar:alarm-add-linear"
          color="warning"
        />

        <MetricItem
          label="Books Under Repair"
          value={fNumber(12)}
          icon="solar:medical-kit-linear"
          color="secondary"
        />
      </Stack>
    </Card>
  );
}
