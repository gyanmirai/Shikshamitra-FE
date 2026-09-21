'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, Grid, Stack, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type ConfigStatus = 'configured' | 'active' | 'missing' | 'complete' | 'partial';

interface ConfigItem {
  label: string;
  status: ConfigStatus;
  path: string;
  icon: string;
}

type LabelColor = 'info' | 'success' | 'error' | 'warning';
const STATUS_COLOR: Record<ConfigStatus, LabelColor> = {
  configured: 'info',
  active: 'success',
  missing: 'error',
  complete: 'success',
  partial: 'warning',
};

// ----------------------------------------------------------------------

export default function ConfigurationStatus({ items }: { items?: ConfigItem[] }) {
  const router = useRouter();
  const displayItems = items ?? [];

  return (
    <Card
      sx={{
        height: '100%',
        p: 2,
        boxShadow: 'none',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <CardHeader
        title="School-wide Configuration"
        subheader="Institution-level setup used by every class"
        sx={{ p: 0, mb: 1.5 }}
      />

      {displayItems.length === 0 ? (
        <EmptyContent
          filled
          title="No configuration status available"
          description="Module setup status will appear after academic configuration begins."
          sx={{ minHeight: 220 }}
          slotProps={{ img: { maxWidth: 88 } }}
        />
      ) : (
        <Grid container spacing={1}>
          {displayItems.map((item) => {
            const color = STATUS_COLOR[item.status] || 'info';
            return (
              <Grid key={item.label} size={{ xs: 6 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  onClick={() => router.push(item.path)}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,

                    border: (t) => `1px solid ${t.palette.divider}`,
                    cursor: 'pointer',
                    transition: (t) => t.transitions.create('box-shadow'),
                    '&:hover': { boxShadow: (t) => t.shadows[2] },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      color: `${color}.main`,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={item.icon || 'solar:info-circle-bold'} width={16} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={600} noWrap display="block">
                      {item.label}
                    </Typography>
                    <Label color={color} variant="soft" sx={{ height: 18, fontSize: '0.6rem' }}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Label>
                  </Box>
                  <Iconify
                    icon="solar:arrow-right-linear"
                    width={14}
                    sx={{ color: 'text.disabled', flexShrink: 0 }}
                  />
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Card>
  );
}
