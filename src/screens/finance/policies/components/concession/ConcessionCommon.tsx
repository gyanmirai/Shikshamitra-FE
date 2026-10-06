'use client';

import type { ReactNode } from 'react';

import { Stack, Paper, Typography, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

export function ConcessionSectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 0 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        {icon && <Iconify icon={icon} width={20} sx={{ color: 'text.secondary', flexShrink: 0 }} />}
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" component="h3">
            {title}
          </Typography>
          {subtitle && (
            <CustomTooltip arrow placement="right" title={subtitle}>
              <IconButton size="small" aria-label={`${title} information`}>
                <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
              </IconButton>
            </CustomTooltip>
          )}
        </Stack>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}
