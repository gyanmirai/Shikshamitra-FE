import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

export interface AlertItemProps {
  title: string;
  subtitle: string;
  info: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'default';
  icon: string;
  isCritical?: boolean;
  action?: ReactNode;
}

export function AlertItem({
  title,
  subtitle,
  info,
  status,
  icon,
  isCritical,
  action,
}: AlertItemProps) {
  const theme = useTheme();
  const token = isCritical ? 'error' : status;
  const color = token === 'default' ? theme.palette.text.secondary : theme.palette[token].main;
  const statusIcon =
    token === 'error'
      ? 'solar:danger-circle-linear'
      : token === 'warning'
        ? 'solar:clock-circle-linear'
        : token === 'success'
          ? 'solar:check-circle-linear'
          : 'solar:info-circle-linear';
  return (
    <Box
      component="article"
      sx={{
        mb: 1,
        p: 1,
        position: 'relative',
        borderRadius: 1,
        border: `1px solid ${alpha(color, 0.1)}`,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Box sx={{ width: 40, height: 40, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Iconify icon={icon} width={24} />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Typography component="h3" variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {info}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="flex-start" spacing={0.5} sx={{ mt: 0.5 }}>
            <Iconify icon={statusIcon} width={16} sx={{ color, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {subtitle}
            </Typography>
          </Stack>
          {action && <Box sx={{ mt: 1 }}>{action}</Box>}
        </Box>
      </Stack>
    </Box>
  );
}
