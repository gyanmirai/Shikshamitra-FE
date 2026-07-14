'use client';

import type { ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import { RouterLink } from 'src/routes/components';
import { Box, Tab, Tabs, Stack, Typography } from '@mui/material';
import { isPlainPrimaryNavigationClick } from 'src/components/nav-section/path-utils';

import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { serializeEnrollmentWorkspaceState } from '../admissions-crm/enrollment-workspace-state';

import type { EnrollmentSettingsPanel } from '../admissions-crm/enrollment-workspace-state';

type SettingsPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

type SettingsPanelOption = {
  value: EnrollmentSettingsPanel;
  label: string;
};

type SettingsPanelTabsProps = {
  label: string;
  value: EnrollmentSettingsPanel;
  options: SettingsPanelOption[];
};

export function EnrollmentSettingsPage({ title, description, children }: SettingsPageProps) {
  return (
    <Stack spacing={1.5} sx={{ minWidth: 0 }}>
      <Box component="header">
        <Typography component="h1" variant="h5" sx={{ textWrap: 'balance' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, textWrap: 'pretty' }}>
          {description}
        </Typography>
      </Box>
      {children}
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
