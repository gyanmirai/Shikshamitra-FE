'use client';

import { Paper, Typography, LinearProgress } from '@mui/material';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

export function AdmissionsCrmConfigurationSection1() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const { academicYearId, isFetching } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      {isFetching && <LinearProgress />}
      {!academicYearId && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Select an academic year to configure admissions CRM.
          </Typography>
        </Paper>
      )}
    </>
  );
}
