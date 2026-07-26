'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { hrPaths } from 'src/constants/hr-menus';
import { Box, Alert, LinearProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { LeavePoliciesPanel } from '../components/LeavePoliciesPanel';

export default function LeavePoliciesWorkspace() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Leave Policies"
        description="Manage leave entitlement, accrual, carry-forward, encashment, and approval rules."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Policies & Rules', href: hrPaths.policies.calendars },
          { name: 'Leave Policies' },
        ]}
      />
      {!currentYear?.id ? (
        <Alert severity="warning">Select an academic year to manage leave policies.</Alert>
      ) : null}
      {!currentYear ? <LinearProgress /> : null}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, mt: 1 }}>
        <LeavePoliciesPanel />
      </Box>
    </Box>
  );
}
