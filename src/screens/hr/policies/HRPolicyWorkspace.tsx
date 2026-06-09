'use client';

/**
 * HRPolicyWorkspace - Thin orchestrator.
 *
 * All state, queries, and mutations are encapsulated in `useHRPolicyWorkspace`.
 * Each tab and drawer is a dedicated component importing from this hook's context type.
 *
 * Governance compliance: no logic here, purely composition.
 */

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Tab, Alert, Paper, Drawer, LinearProgress } from '@mui/material';

import { PolicyTable } from './components/PolicyTable';
import { CalendarsTab } from './components/CalendarsTab';
import { AssignmentsTab } from './components/AssignmentsTab';
import { HR_POLICY_TABS } from './hr-policy-workspace.constants';
import { HolidayImpactTab } from './components/HolidayImpactTab';
import { PolicyAuditDrawer } from './components/PolicyAuditDrawer';
import { useHRPolicyWorkspace } from './hooks/useHRPolicyWorkspace';
import { PolicyImpactDrawer } from './components/PolicyImpactDrawer';
import { LeavePoliciesPanel } from './components/LeavePoliciesPanel';
import { PolicyVersionDrawer } from './components/PolicyVersionDrawer';
import { EffectivePreviewTab } from './components/EffectivePreviewTab';
import { ManualHolidayDialog } from './components/ManualHolidayDialog';
import { PayrollPolicyDrawer } from './components/PayrollPolicyDrawer';
import { PolicyOperationOverlay } from './components/HRPolicySharedUI';
import { CalendarPolicyDrawer } from './components/CalendarPolicyDrawer';
import { AttendancePolicyDrawer } from './components/AttendancePolicyDrawer';
import { AssignmentPolicyDrawer } from './components/AssignmentPolicyDrawer';

import type { HRPolicyWorkspaceProps } from './types/hr-policy-workspace.types';

export default function HRPolicyWorkspace({ focus }: HRPolicyWorkspaceProps) {
  const ctx = useHRPolicyWorkspace({ focus, tabs: HR_POLICY_TABS });

  const {
    tab,
    setTab,
    drawer,
    closeDrawer,
    isLoading,
    academicYearId,
    currentYear,
    activePolicyOperation,
    drawerTransitionDuration,
  } = ctx;

  // Get the current tab label for breadcrumbs
  const currentTabLabel = HR_POLICY_TABS.find((t) => t.value === tab)?.label || 'Policies';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Policies & Rules"
        description={currentYear?.name || 'No academic year selected'}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Policies & Rules', href: hrPaths.policies.root },
          { name: currentTabLabel },
        ]}
      />
      {!academicYearId ? (
        <Alert severity="warning">Select an academic year to manage HR policies.</Alert>
      ) : null}
      {isLoading ? <LinearProgress /> : null}

      <Paper
        sx={{
          mt: 1,
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: '12px' }}
          role="tablist"
        >
          {HR_POLICY_TABS.map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              label={item.label}
              icon={<Iconify icon={item.icon} width={20} />}
              disabled={item.disabled}
            />
          ))}
        </CustomTabs>
      </Paper>

      {/* Tab content */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, mt: 1 }}>
        {tab === 'calendars' ? <CalendarsTab ctx={ctx} /> : null}
        {tab === 'payroll' ? <PolicyTable type="payroll" ctx={ctx} /> : null}
        {tab === 'attendance' ? <PolicyTable type="attendance" ctx={ctx} /> : null}
        {tab === 'leave' ? <LeavePoliciesPanel /> : null}
        {tab === 'assignments' ? <AssignmentsTab ctx={ctx} /> : null}
        {tab === 'holiday' ? <HolidayImpactTab ctx={ctx} /> : null}
        {tab === 'effective' ? <EffectivePreviewTab /> : null}
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
        {drawer?.kind === 'payroll' ? <PayrollPolicyDrawer ctx={ctx} /> : null}
        {drawer?.kind === 'attendance' ? <AttendancePolicyDrawer ctx={ctx} /> : null}
        {drawer?.kind === 'assignment' ? <AssignmentPolicyDrawer ctx={ctx} /> : null}
      </Drawer>

      {/* Dialogs and overlay drawers */}
      <ManualHolidayDialog ctx={ctx} />
      <PolicyImpactDrawer ctx={ctx} />
      <PolicyAuditDrawer ctx={ctx} />
      <PolicyVersionDrawer ctx={ctx} />

      {/* Global operation spinner - excludes impact preview (shown in its own drawer) */}
      <PolicyOperationOverlay
        operation={activePolicyOperation?.key === 'preview-impact' ? null : activePolicyOperation}
      />
    </Box>
  );
}
