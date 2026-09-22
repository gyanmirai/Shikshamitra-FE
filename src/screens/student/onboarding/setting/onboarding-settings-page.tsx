'use client';

import type { TooltipProps } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { OnboardingSettingsBreadcrumbInfo } from './onboarding-settings-breadcrumb-info';

const settingsItems = [
  {
    title: 'Readiness & Access',
    description:
      'Manage saved readiness defaults, approvals, handoffs, and student or guardian access.',
    path: studentPaths.onboarding.settingsSections.readinessAccess,
    icon: 'mdi:account-check-outline',
  },
  {
    title: 'Numbering & Placement',
    description:
      'Manage saved GR and seat settings, roll numbering, and safe Division-change behavior.',
    path: studentPaths.onboarding.settingsSections.numberingPlacement,
    icon: 'mdi:identifier',
  },
];

export default function OnboardingSettingsPage() {
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Student Onboarding Settings"
        description=" "
        tooltipProps={
          {
            title: (
              <OnboardingSettingsBreadcrumbInfo
                title="Student Onboarding settings"
                description="Control readiness, identifiers, roll numbers, and portal access without crowding daily work."
                items={[
                  'Manage activation readiness and portal-access rules.',
                  'Configure GR, Roll number, and Division placement policies.',
                  'Save backend readiness, seat reservation, and GR identifier settings in their related sections.',
                ]}
              />
            ),
            sx: { textAlign: 'left' },
          } as TooltipProps
        }
        links={[
          { name: 'Student Management', href: studentPaths.dashboard },
          { name: 'Student Onboarding', href: studentPaths.onboarding.setup },
          { name: 'Settings' },
        ]}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {settingsItems.map((item) => (
          <Paper
            key={item.title}
            component={RouterLink}
            href={item.path}
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
              color: 'inherit',
              textDecoration: 'none',
              transition: (theme) => theme.transitions.create(['border-color', 'box-shadow']),
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 2,
              },
              '&:focus-visible': {
                outline: (theme) => `3px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                color: 'primary.main',
              }}
            >
              <Iconify icon={item.icon} width={22} />
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" fontWeight={700}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Iconify icon="mdi:information-outline" width={20} color="info.main" />
          <Box>
            <Typography variant="subtitle2">Persistence boundary</Typography>
            <Typography variant="body2" color="text.secondary">
              Saved defaults inside Readiness & Access and Numbering & Placement use the backend.
              Advanced academic rules remain frontend-session previews when no backend contract
              exists.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}

export function OnboardingSettingsSectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Stack spacing={2} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
      <CustomBreadcrumbs
        heading={title}
        description=" "
        tooltipProps={
          {
            title: (
              <OnboardingSettingsBreadcrumbInfo
                title={`${title} settings`}
                description={description}
              />
            ),
            sx: { textAlign: 'left' },
          } as TooltipProps
        }
        links={[
          { name: 'Student Management', href: studentPaths.dashboard },
          { name: 'Student Onboarding', href: studentPaths.onboarding.setup },
          { name: 'Settings', href: studentPaths.onboarding.settings },
          { name: title },
        ]}
      />
      <Paper
        variant="outlined"
        sx={{ flex: 1, minHeight: 240, display: 'grid', placeItems: 'center', p: 3 }}
      >
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {title} configuration will be added in a later onboarding phase.
        </Typography>
      </Paper>
    </Stack>
  );
}
