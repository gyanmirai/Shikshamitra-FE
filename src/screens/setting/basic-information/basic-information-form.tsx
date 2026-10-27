'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { Box, Grid, Card, Stack, Alert, Button, Typography } from '@mui/material';

import { useBasicInformationForm } from './use-basic-information-form';
import { BasicInformationSectionHeader } from './basic-information-section-header';
import { BasicInformationProfileFields } from './basic-information-profile-fields';
import { BasicInformationLocationFields } from './basic-information-location-fields';

import type { BasicInformationFormProps } from './types';

export function BasicInformationForm(props: BasicInformationFormProps) {
  const theme = useTheme();
  const { formik, editing, saving } = useBasicInformationForm(props);
  return (
    <Box
      component={motion.form}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={formik.handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Scrollbar sx={{ flexGrow: 1, p: 3 }}>
        {formik.status && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formik.status}
          </Alert>
        )}
        <Box component="fieldset" disabled={saving} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ p: 3, height: '100%', boxShadow: theme.customShadows.z4 }}>
                <BasicInformationSectionHeader
                  title="Institute Profile"
                  icon="solar:buildings-bold"
                  subtitle="Basic details and location"
                />
                <Grid container spacing={3}>
                  <BasicInformationProfileFields formik={formik} editing={editing} />
                  <BasicInformationLocationFields formik={formik} />
                </Grid>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                <Card sx={{ p: 3, boxShadow: theme.customShadows.z4 }}>
                  <BasicInformationSectionHeader
                    title="School Identity"
                    icon="solar:gallery-wide-bold"
                    subtitle="School logos and signatures"
                  />
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Manage the school logo, banner and principal’s signature in School Identity
                    after institute setup.
                  </Typography>
                  <Button component="a" href={instituteSetupPaths.schoolIdentity}>
                    Open School Identity
                  </Button>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Scrollbar>
      <Box
        sx={{
          p: 2,
          borderTop: `1px dashed ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          startIcon={<Iconify icon={saving ? 'line-md:loading-loop' : 'solar:disk-bold'} />}
        >
          {editing ? 'Update & Next' : 'Save & Next'}
        </Button>
      </Box>
    </Box>
  );
}
