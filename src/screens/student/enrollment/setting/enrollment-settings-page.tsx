'use client';

import type { ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { RouterLink } from 'src/routes/components';
import useMediaQuery from '@mui/material/useMediaQuery';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { isPlainPrimaryNavigationClick } from 'src/components/nav-section/path-utils';
import { Box, Tab, Tabs, Step, Stack, Stepper, StepButton, Typography } from '@mui/material';

import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { serializeEnrollmentWorkspaceState } from '../admissions-crm/enrollment-workspace-state';

import type { EnrollmentSettingsPanel } from '../admissions-crm/enrollment-workspace-state';

type SettingsPageProps = {
  title: string;
  description: string;
  children: ReactNode;
  fillAvailableHeight?: boolean;
};

type SettingsPanelOption = {
  value: EnrollmentSettingsPanel;
  label: string;
  description?: string;
};

type SettingsPanelTabsProps = {
  label: string;
  value: EnrollmentSettingsPanel;
  options: SettingsPanelOption[];
};

export function EnrollmentSettingsPage({
  title,
  description,
  children,
  fillAvailableHeight = false,
}: SettingsPageProps) {
  const { state } = useEnrollmentWorkspace();
  const cycleQuery = state.cycle ? `?cycle=${encodeURIComponent(state.cycle)}` : '';

  return (
    <Stack
      spacing={1.5}
      sx={{
        minWidth: 0,
        minHeight: fillAvailableHeight ? 0 : undefined,
        flex: fillAvailableHeight ? 1 : undefined,
      }}
    >
      <Box component="header">
        <CustomBreadcrumbs
          heading={title}
          description={description}
          links={[
            { name: 'Student', href: studentPaths.dashboard },
            {
              name: 'Student Enrollment',
              href: `${studentPaths.enrollment.overview}${cycleQuery}`,
            },
            { name: 'Settings', href: `${studentPaths.enrollment.settings}${cycleQuery}` },
            { name: title },
          ]}
          sx={{ px: 2 }}
        />
      </Box>
      <Box
        sx={{
          px: 2,
          display: fillAvailableHeight ? 'flex' : undefined,
          flexDirection: fillAvailableHeight ? 'column' : undefined,
          gap: fillAvailableHeight ? 1.5 : undefined,
          minWidth: 0,
          minHeight: fillAvailableHeight ? 0 : undefined,
          flex: fillAvailableHeight ? 1 : undefined,
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}

export function EnrollmentSettingsPanelTabs({ label, value, options }: SettingsPanelTabsProps) {
  const pathname = usePathname();
  const { state, updateState } = useEnrollmentWorkspace();

  const getPanelHref = (panel: EnrollmentSettingsPanel) => {
    const query = serializeEnrollmentWorkspaceState({
      ...state,
      page: 1,
      settingsPanel: panel,
    }).toString();

    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', minWidth: 0 }}>
      <Tabs
        value={value}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label={label}
      >
        {options.map((option) => (
          <Tab
            key={option.value}
            component={RouterLink}
            href={getPanelHref(option.value)}
            value={option.value}
            label={option.label}
            onClick={(event) => {
              if (!isPlainPrimaryNavigationClick(event)) return;
              event.preventDefault();
              updateState({ settingsPanel: option.value, page: 1 }, 'push');
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}

export function EnrollmentSettingsSetupSteps({ label, value, options }: SettingsPanelTabsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const pathname = usePathname();
  const { state, updateState } = useEnrollmentWorkspace();
  const activeStep = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  const getPanelHref = (panel: EnrollmentSettingsPanel) => {
    const query = serializeEnrollmentWorkspaceState({
      ...state,
      page: 1,
      settingsPanel: panel,
    }).toString();

    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <Box component="section" aria-label={label} sx={{ py: 0.5, minWidth: 0 }}>
      <Typography variant="overline" color="text.secondary">
        Setup sequence
      </Typography>
      <Stepper
        nonLinear
        activeStep={activeStep}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{ mt: 0.25 }}
      >
        {options.map((option, index) => (
          <Step key={option.value} completed={false}>
            <StepButton
              component={RouterLink}
              href={getPanelHref(option.value)}
              onClick={(event) => {
                if (!isPlainPrimaryNavigationClick(event)) return;
                event.preventDefault();
                updateState({ settingsPanel: option.value, page: 1 }, 'push');
              }}
              aria-current={index === activeStep ? 'step' : undefined}
            >
              <Stack spacing={0.125} sx={{ textAlign: 'left', minWidth: 0 }}>
                <Typography variant="subtitle2">{option.label}</Typography>
                {option.description ? (
                  <Typography variant="caption" color="text.secondary" sx={{ textWrap: 'pretty' }}>
                    {option.description}
                  </Typography>
                ) : null}
              </Stack>
            </StepButton>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
