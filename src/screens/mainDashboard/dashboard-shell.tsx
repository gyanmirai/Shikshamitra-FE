'use client';

import type { ReactNode } from 'react';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { Box, Stack, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { DASHBOARD_TEMPLATE_META, type DashboardDataContract } from './dashboard-types';

type DashboardShellProps = {
  data: DashboardDataContract;
  children: ReactNode;
  presentationRole?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  headerAction?: ReactNode;
  contextAction?: ReactNode;
};

const roleTitles: Record<string, string> = {
  leadership: 'Leadership',
  principal: 'Principal',
  admissions: 'Admissions',
  teacher: 'Teacher',
  finance: 'Finance',
  hr: 'HR',
  student: 'Student',
  parent: 'Parent',
  principalAdmin: 'Principal/Admin',
  financeHr: 'Finance/HR',
  studentParent: 'Student/Parent',
};

function formatUpdatedAt(value?: string) {
  if (!value || Number.isNaN(new Date(value).getTime())) return null;
  return `Updated ${new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))}`;
}

export function DashboardShell({
  data,
  children,
  presentationRole,
  onRefresh,
  isRefreshing = false,
  headerAction,
  contextAction,
}: DashboardShellProps) {
  const meta = DASHBOARD_TEMPLATE_META[data.dashboardTemplate];
  const title = `${roleTitles[presentationRole ?? data.dashboardTemplate] ?? meta.label} Dashboard`;
  const updatedAt = formatUpdatedAt(data.generatedAtUtc);

  return (
    <DashboardContent sx={{ width: 1, minWidth: 0, maxWidth: 1600, mx: 'auto', py: 1 }}>
      <Stack
        spacing={1.5}
        data-testid="dashboard-root"
        data-dashboard-template={data.dashboardTemplate}
      >
        <Box data-testid={`dashboard-template-${data.dashboardTemplate}`}>
          <CustomBreadcrumbs
            heading={title}
            headingComponent="h1"
            description={meta.description}
            links={[{ name: 'Dashboard' }]}
            action={
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {onRefresh && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={onRefresh}
                    loading={isRefreshing}
                    loadingPosition="start"
                    disabled={isRefreshing}
                    startIcon={<Iconify icon="mdi:refresh" width={18} aria-hidden />}
                  >
                    Refresh
                  </Button>
                )}
                {headerAction}
              </Stack>
            }
          />
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ px: 1 }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ minWidth: 0, '& > *': { overflowWrap: 'anywhere' } }}
          >
            <Typography variant="body2">{data.scopeLabel || 'Your permitted scope'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {data.dateRange.label}
            </Typography>
            {updatedAt && (
              <Typography variant="caption" color="text.secondary">
                {updatedAt}
              </Typography>
            )}
            {data.dataState === 'partial' && (
              <Label color="warning">Some data is unavailable</Label>
            )}
          </Stack>
          {contextAction}
        </Stack>
        {children}
        <Typography variant="caption" color="text.secondary" sx={{ px: 1, pb: 1 }}>
          Values and actions are limited by your permissions and school data scope.
        </Typography>
      </Stack>
    </DashboardContent>
  );
}
