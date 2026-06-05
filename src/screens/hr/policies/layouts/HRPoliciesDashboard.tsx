'use client';

/**
 * HRPoliciesDashboard — Main policies & rules page with vertical tab navigation on left.
 *
 * Provides a hub for navigating between different policy types with a sidebar layout.
 * Similar structure to attendance management with vertical tabs.
 */

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useRouter, usePathname } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Paper, Stack, Button, Typography } from '@mui/material';

import type { WorkspaceTab } from '../types/hr-policy-workspace.types';

// ─── Policy Tab Navigation Items ──────────────────────────────────────────────

const POLICY_NAV_ITEMS: Array<{
  key: WorkspaceTab;
  label: string;
  icon: string;
  path: string;
  description: string;
}> = [
  {
    key: 'calendars',
    label: 'Work Calendars',
    icon: 'mdi:calendar-month-outline',
    path: hrPaths.policies.calendars,
    description: 'Manage working calendars and holiday rules',
  },
  {
    key: 'payroll',
    label: 'Payroll Policies',
    icon: 'mdi:cash-sync',
    path: hrPaths.policies.payroll,
    description: 'Configure salary calculation rules',
  },
  {
    key: 'attendance',
    label: 'Attendance Policies',
    icon: 'mdi:account-clock-outline',
    path: hrPaths.policies.attendance,
    description: 'Set attendance and time tracking rules',
  },
  {
    key: 'assignments',
    label: 'Assignments',
    icon: 'mdi:account-switch-outline',
    path: hrPaths.policies.assignments,
    description: 'Assign policies to employees and groups',
  },
];

interface HRPoliciesDashboardProps {
  children?: React.ReactNode;
}

export default function HRPoliciesDashboard({ children }: HRPoliciesDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { userPermissions } = useSelector((state: RootState) => state.auth);

  // Determine current active tab based on pathname
  const activeTab =
    POLICY_NAV_ITEMS.find((item) => pathname.includes(item.path))?.key || 'calendars';

  const canViewPolicies = hasGrantedPermission(userPermissions, [hrPermissions.policyActions.view]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Policies & Rules"
        description={currentYear?.name || 'No academic year selected'}
        links={[{ name: 'HR/Staff', href: hrPaths.dashboard }, { name: 'Policy Management' }]}
      />

      {/* Left sidebar with vertical tabs + Main content area */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0, mt: 2 }}>
        {/* Left Sidebar - Vertical Tab Navigation */}
        <Paper
          sx={{
            width: { xs: '100%', md: 280 },
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            height: 'fit-content',
            position: 'sticky',
            top: 16,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
            Policy Types
          </Typography>
          <Stack spacing={1}>
            {POLICY_NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <Button
                  key={item.key}
                  fullWidth
                  onClick={() => handleNavigation(item.path)}
                  variant={isActive ? 'contained' : 'outlined'}
                  startIcon={<Iconify icon={item.icon} width={20} />}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    borderRadius: 1,
                    textTransform: 'none',
                    ...(isActive && {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }),
                  }}
                >
                  <Stack spacing={0.5} sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 500 }}>
                      {item.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        display: 'block',
                        fontSize: '11px',
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Stack>
                </Button>
              );
            })}
          </Stack>
        </Paper>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {children || (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Select a policy type from the left to get started
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
