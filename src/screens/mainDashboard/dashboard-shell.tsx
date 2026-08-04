'use client';

import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { varAlpha } from 'src/theme/styles';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Chip, Stack, Typography } from '@mui/material';

import { DASHBOARD_TEMPLATE_META, type DashboardDataContract } from './dashboard-types';

type DashboardShellProps = {
  data: DashboardDataContract;
  children: ReactNode;
};

const formatUpdatedAt = (value?: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `Updated ${new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)}`;
};

export function DashboardShell({ data, children }: DashboardShellProps) {
  const theme = useTheme();
  const palette = theme.vars?.palette ?? theme.palette;
  const primaryAlpha = (opacity: number) =>
    palette.primary.mainChannel
      ? varAlpha(palette.primary.mainChannel, opacity)
      : alpha(palette.primary.main, opacity);
  const templateMeta = DASHBOARD_TEMPLATE_META[data.dashboardTemplate];
  const updatedAt = formatUpdatedAt(data.generatedAtUtc);
  const isPartial = data.dataState === 'partial';

  return (
    <DashboardContent
      sx={{
        width: '100%',
        maxWidth: 1600,
        mx: 'auto',
        px: { xs: 2, sm: 3, lg: 'var(--layout-dashboard-content-px)' },
        py: { xs: 2, md: 3 },
      }}
    >
      <Stack
        spacing={{ xs: 2.5, md: 3 }}
        data-testid="dashboard-root"
        data-dashboard-template={data.dashboardTemplate}
      >
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            overflow: 'hidden',
            border: '1px solid',
            borderColor: primaryAlpha(0.2),
            background: `radial-gradient(circle at 88% 12%, ${primaryAlpha(0.2)}, transparent 34%), linear-gradient(145deg, ${primaryAlpha(0.08)}, ${palette.background.paper} 72%)`,
          }}
          data-testid={`dashboard-template-${data.dashboardTemplate}`}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2.5}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 50,
                  height: 50,
                  flex: '0 0 auto',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 2,
                  color: 'primary.main',
                  bgcolor: primaryAlpha(0.14),
                }}
              >
                <Iconify icon="solar:buildings-3-bold-duotone" width={29} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" color="primary.main">
                  {templateMeta.eyebrow}
                </Typography>
                <Typography component="h1" variant="h3" sx={{ textWrap: 'balance' }}>
                  {templateMeta.label} dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
                  {templateMeta.description}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            >
              <Chip
                icon={<Iconify aria-hidden="true" icon="solar:calendar-date-linear" width={18} />}
                label={data.dateRange.label}
                variant="outlined"
              />
              <Chip
                icon={
                  <Iconify aria-hidden="true" icon="solar:users-group-rounded-linear" width={18} />
                }
                label={data.scopeLabel || 'Your permitted scope'}
                variant="outlined"
              />
              {updatedAt ? (
                <Chip
                  icon={<Iconify aria-hidden="true" icon="solar:refresh-linear" width={18} />}
                  label={updatedAt}
                  color={isPartial ? 'warning' : 'success'}
                  variant="soft"
                />
              ) : null}
            </Stack>
          </Stack>
        </Card>

        {children}

        <Typography variant="caption" color="text.secondary" sx={{ pb: 1 }}>
          Values and actions are limited by your permissions and school data scope.
        </Typography>
      </Stack>
    </DashboardContent>
  );
}
