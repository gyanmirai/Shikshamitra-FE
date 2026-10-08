import React from 'react';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Paper, Stack, IconButton, Typography } from '@mui/material';

// ---------------------------------------------------------------------------
// SectionCard — labelled card wrapper used throughout PaymentTermForm sections
// ---------------------------------------------------------------------------
interface SectionCardProps {
  title: string;
  subtitle?: string;
  info?: string;
  /** Optional action element rendered in the card header (e.g. an "Add" button) */
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, subtitle, info, action, children }: SectionCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        minWidth: 0,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          mb: 2.5,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {(info || subtitle) && (
            <CustomTooltip arrow placement="bottom" title={info || subtitle || ''}>
              <IconButton size="small" aria-label={`${title} information`}>
                <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
              </IconButton>
            </CustomTooltip>
          )}
        </Stack>
        {action}
      </Stack>
      <Box>{children}</Box>
    </Paper>
  );
}
