'use client';

import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Tab, Box, Paper, Stack } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { settingsTasks } from '../records-settings-model';

import type { RecordsSettingsTask } from '../records-settings-model';

type Props = {
  task: RecordsSettingsTask;
  suffix?: string;
  children: ReactNode;
};

export default function RecordsSettingsWorkspace({ task, suffix = '', children }: Props) {
  const selected = settingsTasks.find((item) => item.key === task)!;
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Student Records Settings"
        description={selected.description}
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'Settings' },
        ]}
      />
      <Paper variant="outlined" sx={{ flexShrink: 0, minWidth: 0, px: 1, overflow: 'hidden' }}>
        <CustomTabs
          value={task}
          guardUnsavedChanges={false}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Student Records settings tasks"
          slotProps={{
            scroller: { px: 0, py: 0.5 },
            tab: { minHeight: 44, px: { xs: 1.25, sm: 2 } },
            flexContainer: { gap: 0.5 },
          }}
        >
          {settingsTasks.map((item) => (
            <Tab
              key={item.key}
              component={RouterLink}
              href={`${studentPaths.records.settingsSections[item.key]}${suffix}`}
              prefetch={false}
              value={item.key}
              id={`records-settings-${item.key}-tab`}
              aria-controls={`records-settings-${item.key}-panel`}
              icon={<Iconify icon={item.icon} width={19} />}
              iconPosition="start"
              label={item.title}
              sx={{ textDecoration: 'none' }}
            />
          ))}
        </CustomTabs>
      </Paper>
      <Box
        role="tabpanel"
        id={`records-settings-${task}-panel`}
        aria-labelledby={`records-settings-${task}-tab`}
        sx={{ minWidth: 0 }}
      >
        <Stack spacing={2}>{children}</Stack>
      </Box>
    </Stack>
  );
}
