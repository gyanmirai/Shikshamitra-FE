'use client';

import React from 'react';
import { Box, Grid, Card, Switch, Typography, FormControlLabel } from '@mui/material';

import { SectionCard } from './CollectionCommon';

interface CollectionOnlineSectionProps {
  formik: any;
}

export default function CollectionOnlineSection({ formik }: CollectionOnlineSectionProps) {
  return (
    <SectionCard
      title="Online Collection Settings"
      subtitle="Configure payment gateway collection behavior."
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <Card
            variant="outlined"
            sx={{
              px: 2,
              py: 1.25,
              display: 'flex',
              alignItems: 'center',
              bgcolor: formik.values.allowOnlineCollection ? 'info.lighter' : 'transparent',
              borderColor: formik.values.allowOnlineCollection ? 'info.light' : 'divider',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() =>
              formik.setFieldValue('allowOnlineCollection', !formik.values.allowOnlineCollection)
            }
          >
            <FormControlLabel
              sx={{ m: 0, pointerEvents: 'none' }}
              control={<Switch size="small" checked={formik.values.allowOnlineCollection} />}
              label={
                <Box ml={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    Allow Online Collection
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Enable online payment gateway payments for this collection policy.
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
