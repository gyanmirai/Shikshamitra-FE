'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'src/routes/hooks';
import { CustomTabs } from 'src/components/custom-tabs';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Tab, Paper, Stack, Button } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PortalAccessSettingsScreen from './portal-access-settings';
import { GrNumberSettingsScreen, RollNumberSettingsScreen } from './onboarding-number-settings';
import { onboardingSettingsTabs, getOnboardingSettingsTab } from './onboarding-settings-navigation';

export default function OnboardingSettingsPage() {
  const searchParams = useSearchParams();
  const activeTab = getOnboardingSettingsTab(searchParams.get('tab'));
  const createActionRef = useRef<(() => void) | null>(null);
  const getTabHref = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    return `${studentPaths.onboarding.settings}?${params.toString()}`;
  };

  return (
    <Stack spacing={1} sx={{ minWidth: 0, minHeight: 0, height: 1 }}>
      <CustomBreadcrumbs
        heading="Onboarding Settings"
        description="Set student and parent/guardian login requirements, GR series, and Roll number rules. Admission supplies the student's onboarding requirements."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Onboarding', href: studentPaths.onboarding.setup },
          { name: 'Onboarding Settings' },
        ]}
      />
      <Paper variant="outlined" sx={{ flexShrink: 0, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <CustomTabs
              value={activeTab}
              guardUnsavedChanges={false}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="Onboarding settings"
              sx={{ '& .MuiTabs-flexContainer': { gap: 1 } }}
            >
              {onboardingSettingsTabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  component={Link}
                  href={getTabHref(tab.value)}
                  prefetch={false}
                  scroll={false}
                  label={tab.label}
                  icon={<Iconify icon={tab.icon} width={20} />}
                  iconPosition="start"
                  id={`onboarding-settings-tab-${tab.value}`}
                  aria-controls={`onboarding-settings-panel-${tab.value}`}
                  sx={{ minHeight: 44, py: 1, textDecoration: 'none' }}
                />
              ))}
            </CustomTabs>
          </Box>
          {activeTab !== 'portal-access' && (
            <Box sx={{ px: 1, py: 1, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="mdi:plus" width={18} />}
                onClick={() => createActionRef.current?.()}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {activeTab === 'gr-number' ? 'Add Series' : 'Add Roll Number Rule'}
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>
      <Box
        role="tabpanel"
        id={`onboarding-settings-panel-${activeTab}`}
        aria-labelledby={`onboarding-settings-tab-${activeTab}`}
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: activeTab === 'portal-access' ? 'auto' : 'hidden',
        }}
      >
        {activeTab === 'portal-access' && <PortalAccessSettingsScreen />}
        {activeTab === 'gr-number' && (
          <GrNumberSettingsScreen
            embedded
            showWorkspaceBar={false}
            createActionRef={createActionRef}
          />
        )}
        {activeTab === 'roll-number' && (
          <RollNumberSettingsScreen
            embedded
            showWorkspaceBar={false}
            createActionRef={createActionRef}
          />
        )}
      </Box>
    </Stack>
  );
}
