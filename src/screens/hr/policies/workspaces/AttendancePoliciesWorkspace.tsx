'use client';

/**
 * AttendancePoliciesWorkspace - Dedicated workspace for attendance policies.
 *
 * Focused on attendance policy management with breadcrumbs and permission display.
 */

import React from 'react';
import { hrPaths } from 'src/constants/hr-menus';
import { Box, Alert, Drawer, LinearProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PolicyTable } from '../components/PolicyTable';
import { HR_POLICY_TABS } from '../hr-policy-workspace.constants';
import { PolicyAuditDrawer } from '../components/PolicyAuditDrawer';
import { useHRPolicyWorkspace } from '../hooks/useHRPolicyWorkspace';
import { PolicyImpactDrawer } from '../components/PolicyImpactDrawer';
import { PolicyVersionDrawer } from '../components/PolicyVersionDrawer';
import { PolicyOperationOverlay } from '../components/HRPolicySharedUI';
import { AttendancePolicyDrawer } from '../components/AttendancePolicyDrawer';

import type { HRPolicyWorkspaceProps } from '../types/hr-policy-workspace.types';

export default function AttendancePoliciesWorkspace({ focus }: HRPolicyWorkspaceProps) {
  const ctx = useHRPolicyWorkspace({ focus: 'attendance', tabs: [HR_POLICY_TABS[2]] });

  const {
    drawer,
    closeDrawer,
    isLoading,
    academicYearId,
    currentYear,
    activePolicyOperation,
    drawerTransitionDuration,
    canViewAudit,
  } = ctx;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Attendance Policies"
        description={currentYear?.name || 'No academic year selected'}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Policies & Rules' },
          { name: 'Attendance Policies' },
        ]}
      />
      {!academicYearId ? (
        <Alert severity="warning">Select an academic year to manage HR policies.</Alert>
      ) : null}
      {isLoading ? <LinearProgress /> : null}
      {canViewAudit ? (
        <Box sx={{ typography: 'caption', color: 'text.secondary', pl: 1 }}>
          Set thresholds, grace time, penalties, and advanced rules for attendance
        </Box>
      ) : undefined}
      {/* Tab content */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, mt: 1 }}>
        <PolicyTable type="attendance" ctx={ctx} />
      </Box>

      {/* Drawers */}
      <Drawer
        anchor="right"
        open={Boolean(drawer)}
        onClose={closeDrawer}
        transitionDuration={drawerTransitionDuration}
        PaperProps={{ sx: { width: { xs: '100%', sm: 'min(1180px, 92vw)' }, maxWidth: '100%' } }}
      >
        {drawer?.kind === 'attendance' ? <AttendancePolicyDrawer ctx={ctx} /> : null}
      </Drawer>

      {/* Dialogs and overlay drawers */}
      <PolicyImpactDrawer ctx={ctx} />
      <PolicyAuditDrawer ctx={ctx} />
      <PolicyVersionDrawer ctx={ctx} />

      {/* Global operation spinner */}
      <PolicyOperationOverlay
        operation={activePolicyOperation?.key === 'preview-impact' ? null : activePolicyOperation}
      />
    </Box>
  );
}
