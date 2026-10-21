'use client';

/**
 * HRPolicyWorkspace - Thin orchestrator.
 *
 * Data state, queries, and mutations are encapsulated in `useHRPolicyWorkspace`.
 * Each tab and drawer is a dedicated component importing from this hook's context type.
 *
 * The workspace registers drawer drafts with the shared navigation guard.
 */

import type { RootState } from 'src/redux/store';

import { useRouter } from 'src/routes/hooks';
import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hasNavigationPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { Box, Alert, Drawer, LinearProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { PolicyTable } from './components/PolicyTable';
import { CalendarsTab } from './components/CalendarsTab';
import { AssignmentsTab } from './components/AssignmentsTab';
import { PolicySetupAlert } from './components/PolicySetupAlert';
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
  const dispatch = useDispatch();
  const draftForms = {
    calendar: ctx.calendarForm,
    attendance: ctx.attendanceForm,
    payroll: ctx.payrollForm,
    assignment: ctx.assignmentForm,
  };
  const draftSnapshot = ctx.drawer ? JSON.stringify(draftForms[ctx.drawer.kind]) : undefined;
  const draftBaseline = useRef<{
    drawer: typeof ctx.drawer;
    snapshot: string | undefined;
  } | null>(null);

  // Register drafts with the existing tab, link, refresh and browser-back guards.
  useEffect(() => {
    if (!ctx.drawer || ctx.drawer.mode === 'view') {
      if (draftBaseline.current) dispatch(setIsChanges(false));
      draftBaseline.current = null;
      return;
    }
    if (draftBaseline.current?.drawer !== ctx.drawer) {
      draftBaseline.current = { drawer: ctx.drawer, snapshot: draftSnapshot };
    }
    dispatch(setIsChanges(draftBaseline.current.snapshot !== draftSnapshot));
  }, [ctx.drawer, draftSnapshot, dispatch]);

  useEffect(
    () => () => {
      dispatch(setIsChanges(false));
    },
    [dispatch]
  );

  const {
    tab,
    drawer,
    closeDrawer,
    isLoading,
    academicYearId,
    activePolicyOperation,
    drawerTransitionDuration,
  } = ctx;

  // Get the current tab label for breadcrumbs
  const currentTabLabel = HR_POLICY_TABS.find((t) => t.value === tab)?.label || 'Policies';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, minWidth: 0 }}>
      <CustomBreadcrumbs
        heading={currentTabLabel}
        description={
          tab === 'leave'
            ? 'Manage entitlements, accrual, carry-forward, encashment, and approval rules. Each policy contains one Paid bucket and one Unpaid bucket.'
            : 'Configure staff calendars, policies, and assignments.'
        }
        sx={{ flexShrink: 0 }}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Policies & Rules', href: hrPaths.policies.root },
          { name: currentTabLabel },
        ]}
      />
      {!academicYearId ? <Alert severity="warning">Select an academic year</Alert> : null}
      {isLoading ? <LinearProgress /> : null}
      {academicYearId && !drawer ? (
        <>
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
        </>
      ) : null}

      {/* Tab content */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', mt: 1 }}>
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
