'use client';

import type { ReactNode } from 'react';

import { DashboardContent } from 'src/layouts/dashboard';
import { Box, Card, Chip, Stack, Button, Divider, Typography } from '@mui/material';

import { DASHBOARD_TEMPLATE_META, type DashboardDataContract } from './dashboard-types';

type DashboardShellProps = {
  data: DashboardDataContract;
  children: ReactNode;
};

export function DashboardShell({ data, children }: DashboardShellProps) {
  const templateMeta = DASHBOARD_TEMPLATE_META[data.dashboardTemplate];

  return (
    <DashboardContent disablePadding>
      <Stack
        spacing={2}
        data-testid="dashboard-root"
        data-dashboard-template={data.dashboardTemplate}
      >
        <Card
          variant="outlined"
          sx={{ p: 2 }}
          data-testid={`dashboard-template-${data.dashboardTemplate}`}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4">{templateMeta.label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {templateMeta.description}
              </Typography>
            </Box>
            <Chip label={data.dateRange.label} color="primary" />
          </Stack>
        </Card>

        {children}

        <Divider />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
          <Typography variant="caption" color="text.secondary">
            Dashboard items are filtered by module permissions and should be UserScope-filtered when
            backed by live API data.
          </Typography>
          <Button size="small" href="/security/role" data-testid="dashboard-security-mapping-link">
            Security role mapping
          </Button>
        </Stack>
      </Stack>
    </DashboardContent>
  );
}
