'use client';

import type { RootState } from 'src/redux/store';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Box, Alert, Stack, Button } from '@mui/material';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { hasNavigationPermission } from 'src/utils/permissions';
import { FormSectionCard } from 'src/components/form-section-card';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { hrLeavePolicyPermissions } from 'src/constants/hr-policy-permissions';

import { HRSetupReviewChecklist } from './components/HRSetupReviewChecklist';

const policyTasks = [
  {
    title: 'Work Calendars',
    icon: 'mdi:calendar-month-outline',
    href: hrPaths.policies.calendars,
    permission: hrPermissions.policies.calendars,
    view: hrPermissions.policyActions.view,
    action: 'Open work calendars',
    description:
      'Start with working days, weekly days off, and holidays. Attendance and payroll policies can use different calendars.',
  },
  {
    title: 'Attendance Policies',
    icon: 'mdi:account-clock-outline',
    href: hrPaths.policies.attendance,
    permission: hrPermissions.policies.attendance,
    view: hrPermissions.policyActions.view,
    action: 'Open attendance policies',
    description: 'Choose a work calendar and set attendance expectations and holiday work rules.',
  },
  {
    title: 'Payroll Policies',
    icon: 'mdi:cash-sync',
    href: hrPaths.policies.payroll,
    permission: hrPermissions.policies.payroll,
    view: hrPermissions.policyActions.view,
    action: 'Open payroll policies',
    description: 'Choose a work calendar and set how working days and holidays count for payroll.',
  },
  {
    title: 'Leave Policies',
    icon: 'mdi:calendar-text-outline',
    href: hrPaths.policies.leavePolicies,
    permission: hrPermissions.policies.leavePolicies,
    view: hrLeavePolicyPermissions.view,
    action: 'Open leave policies',
    description:
      'Set entitlements and approvals. The staff member’s payroll calendar and workday rules determine how many days a leave request uses.',
  },
];

export default function HRPolicyOverview() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const academicYear = useSelector((state: RootState) => state.globalState.currentYear);
  const availableTasks = policyTasks.filter(({ permission, view }) =>
    hasNavigationPermission(permissions, permission, [view])
  );
  const canOpenAssignments = hasNavigationPermission(
    permissions,
    hrPermissions.policies.assignments,
    [hrPermissions.policyActions.view]
  );

  return (
    <Box sx={{ minWidth: 0, pb: 2 }}>
      <CustomBreadcrumbs
        heading="Policies & Rules"
        layout="inline"
        description="Manage school defaults for calendars, attendance, payroll, and leave."
        links={[{ name: 'Policies & Rules' }]}
      />
      {availableTasks.length || canOpenAssignments ? (
        <Stack spacing={2}>
          {availableTasks.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {availableTasks.map(({ title, icon, href, description, action }) => (
                <FormSectionCard
                  key={href}
                  title={title}
                  icon={icon}
                  description={description}
                  sx={{
                    gridColumn:
                      href === hrPaths.policies.calendars || href === hrPaths.policies.leavePolicies
                        ? '1 / -1'
                        : undefined,
                  }}
                  action={
                    <Button
                      component={Link}
                      href={href}
                      variant="outlined"
                      color="inherit"
                      size="small"
                    >
                      {action}
                    </Button>
                  }
                  actionFullWidthOnMobile
                />
              ))}
            </Box>
          )}
          {canOpenAssignments && (
            <FormSectionCard
              title="Staff and Group Exceptions"
              icon="mdi:account-switch-outline"
              description="School defaults apply when there is no matching exception. Use an assignment when a staff member or group needs different policies for a specific period."
              action={
                <Button
                  component={Link}
                  href={hrPaths.policies.assignments}
                  variant="outlined"
                  color="inherit"
                  size="small"
                >
                  Open policy assignments
                </Button>
              }
              actionFullWidthOnMobile
            />
          )}
          {academicYear?.id ? (
            <HRSetupReviewChecklist
              academicYearId={academicYear.id}
              yearStart={academicYear.startDate}
              yearEnd={academicYear.endDate}
            />
          ) : (
            <Alert severity="info">
              Select an academic year to see policy records and review settings.
            </Alert>
          )}
        </Stack>
      ) : (
        <Alert severity="info">
          No policy settings are available with your current permissions.
        </Alert>
      )}
    </Box>
  );
}
