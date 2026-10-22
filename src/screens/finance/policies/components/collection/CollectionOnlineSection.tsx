'use client';

import { Label } from 'src/components/label';
import { Box, Grid, Stack, Switch, Typography, FormControlLabel } from '@mui/material';

import { SectionCard, CollectionInfoTip } from './CollectionCommon';

interface CollectionOnlineSectionProps {
  formik: any;
}

export default function CollectionOnlineSection({ formik }: CollectionOnlineSectionProps) {
  const isOnlineAllowed = Boolean(formik.values.allowOnlineCollection);

  return (
    <SectionCard
      subtitle="Choose whether families can pay through the online payment gateway."
      title="Online Collections"

      icon="solar:card-bold"
      action={
        <Label color={isOnlineAllowed ? 'success' : 'default'} sx={{ height: 22 }}>
          {isOnlineAllowed ? 'Enabled' : 'Disabled'}
        </Label>
      }
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    size="small"
                    checked={isOnlineAllowed}
                    onChange={(_, checked) =>
                      formik.setFieldValue('allowOnlineCollection', checked)
                    }
                    sx={{ mr: 1 }}
                  />
                }
                label={<Typography variant="subtitle2">Allow online collections</Typography>}
              />
              <CollectionInfoTip
                label="Allow online collections"
                title="Allow students and parents to pay through the online payment gateway."
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </SectionCard>
  );
}
