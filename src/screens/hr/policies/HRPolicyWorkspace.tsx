'use client';

/**
 * HRPolicyWorkspace — Thin orchestrator.
 *
 * All state, queries, and mutations are encapsulated in `useHRPolicyWorkspace`.
 * Each tab and drawer is a dedicated component importing from this hook's context type.
 *
 * Governance compliance: no logic here, purely composition.
 */

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Paper, Drawer, Typography, LinearProgress } from '@mui/material';

import { PolicyTable } from './components/PolicyTable';
import { CalendarsTab } from './components/CalendarsTab';
import { AssignmentsTab } from './components/AssignmentsTab';
import { HR_POLICY_TABS } from './hr-policy-workspace.constants';
import { HolidayImpactTab } from './components/HolidayImpactTab';
import { PolicyAuditDrawer } from './components/PolicyAuditDrawer';
import { useHRPolicyWorkspace } from './hooks/useHRPolicyWorkspace';
import { PolicyImpactDrawer } from './components/PolicyImpactDrawer';
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Policies & Rules"
        description={currentYear?.name || 'No academic year selected'}
        links={[{ name: 'HR/Staff', href: hrPaths.dashboard }, { name: 'Policy Management' }]}
      />
      {!academicYearId ? (
        <Alert severity="warning">Select an academic year to manage HR policies.</Alert>
      ) : null}
      {isLoading ? <LinearProgress /> : null}

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 2, mt: 1 }}>
        {/* Left navigation panel */}
        <Paper
          sx={{
            width: 220,
            flexShrink: 0,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            py: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {HR_POLICY_TABS.map((item) => {
            const isActive = tab === item.value;
            return (
              <Box
                key={item.value}
                component="button"
                disabled={item.disabled}
                onClick={() => !item.disabled && setTab(item.value)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  px: 2,
                  py: 1.25,
                  border: 'none',
                  background: 'none',
                  cursor: item.disabled ? 'default' : 'pointer',
                  borderLeft: '3px solid',
                  borderLeftColor: isActive ? 'primary.main' : 'transparent',
                  bgcolor: isActive ? 'primary.lighter' : 'transparent',
                  color: isActive
                    ? 'primary.main'
                    : item.disabled
                      ? 'text.disabled'
                      : 'text.secondary',
                  borderRadius: '0 6px 6px 0',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  width: '100%',
                  '&:hover:not(:disabled)': {
                    bgcolor: isActive ? 'primary.lighter' : 'action.hover',
                    color: isActive ? 'primary.main' : 'text.primary',
                  },
                }}
              >
                <Iconify icon={item.icon} width={20} sx={{ flexShrink: 0, color: 'inherit' }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: isActive ? 700 : 500, color: 'inherit', lineHeight: 1.3 }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Paper>

        {/* Tab content */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
          {tab === 'calendars' ? <CalendarsTab ctx={ctx} /> : null}
          {tab === 'payroll' ? <PolicyTable type="payroll" ctx={ctx} /> : null}
          {tab === 'attendance' ? <PolicyTable type="attendance" ctx={ctx} /> : null}
          {tab === 'assignments' ? <AssignmentsTab ctx={ctx} /> : null}
          {tab === 'holiday' ? <HolidayImpactTab ctx={ctx} /> : null}
          {tab === 'effective' ? <EffectivePreviewTab ctx={ctx} /> : null}
        </Box>
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

      {/* Global operation spinner — excludes impact preview (shown in its own drawer) */}
      <PolicyOperationOverlay
        operation={activePolicyOperation?.key === 'preview-impact' ? null : activePolicyOperation}
      />
    </Box>
  );
}
