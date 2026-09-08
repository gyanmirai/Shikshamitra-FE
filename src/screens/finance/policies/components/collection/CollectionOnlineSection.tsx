'use client';

import React from 'react';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Box, Grid, Card, Stack, Switch, Typography, FormControlLabel } from '@mui/material';

import { SectionCard } from './CollectionCommon';

interface CollectionOnlineSectionProps {
  formik: any;
}

export default function CollectionOnlineSection({ formik }: CollectionOnlineSectionProps) {
  const isOnlineAllowed = Boolean(formik.values.allowOnlineCollection);

  return (
    <SectionCard
      title="Online Collection Settings"
      subtitle="Configure payment gateway channels, parent portal collections, and instant settlement rules."
      icon="solar:card-bold"
      action={
        <Label color={isOnlineAllowed ? 'success' : 'default'} sx={{ height: 22 }}>
          {isOnlineAllowed ? 'Online Pay Enabled' : 'Disabled'}
        </Label>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              bgcolor: (theme) =>
                isOnlineAllowed
                  ? alpha(theme.palette.success.main, 0.05)
                  : alpha(theme.palette.background.default, 0.4),
              borderColor: (theme) =>
                isOnlineAllowed ? alpha(theme.palette.success.main, 0.4) : theme.palette.divider,
              boxShadow: (theme) =>
                isOnlineAllowed ? `0 0 0 1px ${alpha(theme.palette.success.main, 0.2)}` : 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                borderColor: (theme) =>
                  isOnlineAllowed ? 'success.main' : alpha(theme.palette.text.primary, 0.2),
              },
            }}
            onClick={() =>
              formik.setFieldValue('allowOnlineCollection', !isOnlineAllowed)
            }
          >
            <FormControlLabel
              sx={{ m: 0, width: '100%', pointerEvents: 'none' }}
              control={
                <Switch
                  size="small"
                  checked={isOnlineAllowed}
                  color="success"
                  sx={{ mr: 1 }}
                />
              }
              label={
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Allow Online Payment Gateway Collection
                    </Typography>
                    {isOnlineAllowed && (
                      <Label color="success" sx={{ height: 18, fontSize: '0.65rem' }}>
                        Active Gateway
                      </Label>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                    Enable student & parent payments via digital channels (Credit/Debit Card, UPI, NetBanking).
                  </Typography>
                </Box>
              }
            />
          </Card>
        </Grid>
      </Grid>
    </SectionCard>
  );
}
