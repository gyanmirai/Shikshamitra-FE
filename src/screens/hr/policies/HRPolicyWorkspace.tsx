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
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { hasNavigationPermission } from 'src/utils/permissions';
import { hrPermissions , hrPaths } from 'src/constants/hr-menus';
import type { RootState } from 'src/redux/store';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Tab, Alert, Paper, Drawer, Typography, LinearProgress } from '@mui/material';

import { PolicySetupAlert } from './components/PolicySetupAlert';
import { PolicyTable } from './components/PolicyTable';
import { CalendarsTab } from './components/CalendarsTab';
import { AssignmentsTab } from './components/AssignmentsTab';
import { HR_POLICY_TABS } from './hr-policy-workspace.constants';
import { PolicyAuditDrawer } from './components/PolicyAuditDrawer';
import { useHRPolicyWorkspace } from './hooks/useHRPolicyWorkspace';
import { PolicyImpactDrawer } from './components/PolicyImpactDrawer';
import { LeavePoliciesPanel } from './components/LeavePoliciesPanel';
import { PolicyVersionDrawer } from './components/PolicyVersionDrawer';
import { ManualHolidayDialog } from './components/ManualHolidayDialog';
import { PayrollPolicyDrawer } from './components/PayrollPolicyDrawer';
import { PolicyOperationOverlay } from './components/HRPolicySharedUI';
import { CalendarPolicyDrawer } from './components/CalendarPolicyDrawer';
import { AttendancePolicyDrawer } from './components/AttendancePolicyDrawer';
import { AssignmentPolicyDrawer } from './components/AssignmentPolicyDrawer';

import type { HRPolicyWorkspaceProps } from './types/hr-policy-workspace.types';

export default function HRPolicyWorkspace({ focus }: HRPolicyWorkspaceProps) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const router = useRouter();
  const destinations = {
    calendars: { href: hrPaths.policies.calendars, permission: hrPermissions.policies.calendars },
    attendance: {
      href: hrPaths.policies.attendance,
      permission: hrPermissions.policies.attendance,
    },
    leave: {
      href: hrPaths.policies.leavePolicies,
      permission: hrPermissions.policies.leavePolicies,
    },
    payroll: { href: hrPaths.policies.payroll, permission: hrPermissions.policies.payroll },
    assignments: {
      href: hrPaths.policies.assignments,
      permission: hrPermissions.policies.assignments,
    },
  };
  const tabs = HR_POLICY_TABS.filter(
    (item) =>
      item.value !== 'holiday' &&
      hasNavigationPermission(permissions, destinations[item.value].permission)
  );
  const ctx = useHRPolicyWorkspace({ focus, tabs });

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
        description="Configure staff calendars, policies, and assignments."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Policies & Rules', href: hrPaths.policies.root },
          { name: currentTabLabel },
        ]}
      />
      {currentYear?.name ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Academic year: {currentYear.name}
        </Typography>
      ) : null}
      {!academicYearId ? <Alert severity="warning">Select an academic year</Alert> : null}
      {isLoading ? <LinearProgress /> : null}
      {academicYearId && !drawer ? (
        <Box sx={{ mt: 1 }}>
          <PolicySetupAlert
            state={ctx.leaveSetupState}
            policy="leave"
            canOpen={ctx.canOpenLeavePolicies}
            onOpen={() => router.push(hrPaths.policies.leavePolicies)}
          />
          <PolicySetupAlert
            state={ctx.attendanceSetupState}
            policy="attendance"
            canOpen={ctx.canOpenAttendancePolicies}
            onOpen={() => router.push(hrPaths.policies.attendance)}
          />
          <PolicySetupAlert
            state={ctx.payrollSetupState}
            policy="payroll"
            canOpen={ctx.canOpenPayrollPolicies}
            onOpen={() => router.push(hrPaths.policies.payroll)}
          />
        </Box>
      ) : null}

      <Paper
        sx={{
          mt: 1,
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tab}
          onChange={(_, value: keyof typeof destinations) => {
            setTab(value);
            router.push(destinations[value].href);
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: '12px' }}
          role="tablist"
        >
          {tabs.map((item) => (
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
