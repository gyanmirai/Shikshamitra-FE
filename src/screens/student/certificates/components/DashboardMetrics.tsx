import React from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

interface MetricItem {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const METRICS: MetricItem[] = [
  { label: 'Bonafide', value: 25, icon: 'solar:document-text-outline', color: '#2065D1' },
  { label: 'Character', value: 8, icon: 'solar:medal-ribbon-star-outline', color: '#00AB55' },
  { label: 'Leaving', value: 3, icon: 'solar:exit-outline', color: '#FF4842' },
  { label: 'First Trial', value: 4, icon: 'solar:diploma-outline', color: '#FFC107' },
];

const DashboardMetrics = () => (
  <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1} alignItems="center">
    {METRICS.map((m) => (
      <Box
        key={m.label}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          border: (t) => `1px solid ${t.palette.divider}`,
          borderLeft: `4px solid ${m.color}`,
          minWidth: 130,
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: alpha(m.color, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Iconify icon={m.icon} width={24} sx={{ color: m.color }} />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" lineHeight={1.2} display="block">
            {m.label}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ color: m.color, mt: 0.5 }} lineHeight={1}>
            {m.value}
          </Typography>
        </Box>
      </Box>
    ))}
  </Stack>
);

export default DashboardMetrics;
