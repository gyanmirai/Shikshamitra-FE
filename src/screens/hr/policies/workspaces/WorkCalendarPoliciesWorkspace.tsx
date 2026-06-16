'use client';

/**
 * WorkCalendarPoliciesWorkspace - Dedicated workspace for work calendar policies.
 *
 * Similar structure to HRPolicyWorkspace but focused on calendars only.
 * Includes breadcrumbs and permission display.
 */

import React from 'react';
import { hrPaths } from 'src/constants/hr-menus';
import { Box, Alert, Drawer, LinearProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CalendarsTab } from '../components/CalendarsTab';
import { getHRPolicyTab } from '../hr-policy-workspace.constants';
import { PolicyAuditDrawer } from '../components/PolicyAuditDrawer';
import { useHRPolicyWorkspace } from '../hooks/useHRPolicyWorkspace';
import { PolicyImpactDrawer } from '../components/PolicyImpactDrawer';
import { PolicyVersionDrawer } from '../components/PolicyVersionDrawer';
import { ManualHolidayDialog } from '../components/ManualHolidayDialog';
import { PolicyOperationOverlay } from '../components/HRPolicySharedUI';
import { CalendarPolicyDrawer } from '../components/CalendarPolicyDrawer';

import type { HRPolicyWorkspaceProps } from '../types/hr-policy-workspace.types';

export default function WorkCalendarPoliciesWorkspace({ focus }: HRPolicyWorkspaceProps) {
  const ctx = useHRPolicyWorkspace({ focus: 'calendars', tabs: [getHRPolicyTab('calendars')] });

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
        heading="Work Calendars"
        description={currentYear?.name || 'No academic year selected'}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Policies & Rules' },
          { name: 'Work Calendars' },
        ]}
      />
      {!academicYearId ? (
        <Alert severity="warning">Select an academic year to manage HR policies.</Alert>
      ) : null}
      {isLoading ? <LinearProgress /> : null}
      {canViewAudit ? (
        <Box sx={{ typography: 'caption', color: 'text.secondary', pl: 1 }}>
          Manage working calendars, weekly rules, and holidays
        </Box>
      ) : undefined}
      {/* Tab content */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, mt: 1 }}>
        <CalendarsTab ctx={ctx} />
      </Box>

      {/* Drawers */}
      <Drawer
        anchor="right"
        open={Boolean(drawer)}
        onClose={closeDrawer}
        transitionDuration={drawerTransitionDuration}
        PaperProps={{ sx: { width: { xs: '100%', sm: 'min(1180px, 92vw)' }, maxWidth: '100%' } }}
      >
        {drawer?.kind === 'calendar' ? <CalendarPolicyDrawer ctx={ctx} /> : null}
      </Drawer>

      {/* Dialogs and overlay drawers */}
      <ManualHolidayDialog ctx={ctx} />
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
