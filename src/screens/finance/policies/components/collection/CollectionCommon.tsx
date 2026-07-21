'use client';

import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';

// SectionCard helper
export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2.5,
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
        borderRadius: 2,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <Typography variant="h6" fontWeight={700} lineHeight={1.4}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Card>
  );
}

// ValidationCheck helper
export function ValidationCheck({ label, valid }: { label: string; valid: boolean }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: 0.2 }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          bgcolor: valid ? 'success.main' : 'action.disabled',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 0.3s',
        }}
      >
        {valid && (
          <Typography sx={{ fontSize: '0.5rem', color: 'white', lineHeight: 1, fontWeight: 900 }}>
            ✓
          </Typography>
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{ fontSize: '0.7rem', color: valid ? 'text.primary' : 'text.disabled' }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

// SummaryRow helper
export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.7rem', flexShrink: 0 }}
      >
        {label}
      </Typography>
      {value}
    </Stack>
  );
}
