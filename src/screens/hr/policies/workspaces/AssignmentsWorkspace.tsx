'use client';

/**
 * AssignmentsWorkspace — Dedicated workspace for policy assignments.
 *
 * Focused on assignment management with breadcrumbs and permission display.
 */

import React from 'react';
import { hrPaths } from 'src/constants/hr-menus';
import { Box, Alert, Drawer, LinearProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AssignmentsTab } from '../components/AssignmentsTab';
import { HR_POLICY_TABS } from '../hr-policy-workspace.constants';
import { PolicyAuditDrawer } from '../components/PolicyAuditDrawer';
import { useHRPolicyWorkspace } from '../hooks/useHRPolicyWorkspace';
import { PolicyImpactDrawer } from '../components/PolicyImpactDrawer';
import { PolicyVersionDrawer } from '../components/PolicyVersionDrawer';
import { PolicyOperationOverlay } from '../components/HRPolicySharedUI';
import { AssignmentPolicyDrawer } from '../components/AssignmentPolicyDrawer';

import type { HRPolicyWorkspaceProps } from '../types/hr-policy-workspace.types';

export default function AssignmentsWorkspace({ focus }: HRPolicyWorkspaceProps) {
  const ctx = useHRPolicyWorkspace({ focus: 'assignments', tabs: [HR_POLICY_TABS[3]] });

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
        heading="Policy Assignments"
        description={currentYear?.name || 'No academic year selected'}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Policies & Rules' },
          { name: 'Policy Assignments' },
        ]}
      />
      {!academicYearId ? (
        <Alert severity="warning">Select an academic year to manage HR policies.</Alert>
      ) : null}
      {isLoading ? <LinearProgress /> : null}
      {canViewAudit ? (
        <Box sx={{ typography: 'caption', color: 'text.secondary', pl: 1 }}>
          Assign payroll and attendance policies to employees and groups
        </Box>
      ) : undefined}
      {/* Tab content */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, mt: 1 }}>
        <AssignmentsTab ctx={ctx} />
      </Box>

      {/* Drawers */}
      <Drawer
        anchor="right"
        open={Boolean(drawer)}
        onClose={closeDrawer}
        transitionDuration={drawerTransitionDuration}
        PaperProps={{ sx: { width: { xs: '100%', sm: 'min(1180px, 92vw)' }, maxWidth: '100%' } }}
      >
        {drawer?.kind === 'assignment' ? <AssignmentPolicyDrawer ctx={ctx} /> : null}
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
