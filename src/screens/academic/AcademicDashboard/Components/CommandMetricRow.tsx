import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

import { getToneMain, getToneContrast, type DashboardCardTone } from './admin-dashboard-card-theme';

type CommandMetricRowProps = {
  label: string;
  value: string | number;
  icon: string;
  tone?: DashboardCardTone;
  helper?: string;
  emphasis?: boolean;
};

export function CommandMetricRow({
  label,
  value,
  icon,
  tone = 'primary',
  helper,
  emphasis = false,
}: CommandMetricRowProps) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 1,
        bgcolor: (theme) => alpha(getToneMain(theme, tone), emphasis ? 0.1 : 0.045),
        border: (theme) => `1px solid ${alpha(getToneMain(theme, tone), emphasis ? 0.26 : 0.14)}`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            color: (theme) => getToneMain(theme, tone),
            bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.1),
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={17} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: emphasis ? 700 : 600 }}>
            {label}
          </Typography>
          {helper ? (
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          ) : null}
        </Box>
        <Typography
          variant="h6"
          sx={{ lineHeight: 1, color: (theme) => getToneContrast(theme, tone) }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}
