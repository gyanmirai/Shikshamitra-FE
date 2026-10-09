'use client';

import type { TooltipProps } from '@mui/material';

import { useRef, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Tab, Paper, Stack, Button } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';

import { OnboardingSettingsBreadcrumbInfo } from './onboarding-settings-breadcrumb-info';
import { GrNumberSettingsScreen, RollNumberSettingsScreen } from './numbering-rules-screen';

export { SettingsDrawer, SettingsSectionCard } from './onboarding-settings-drawer';

export { GrNumberSettingsScreen, RollNumberSettingsScreen } from './numbering-rules-screen';

const numberingPlacementTabs = [
  { value: 'gr-number', label: 'GR Number', icon: 'mdi:identifier' },
  { value: 'roll-number', label: 'Roll Number', icon: 'mdi:format-list-numbered' },
] as const;

export function NumberingPlacementSettingsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createActionRef = useRef<(() => void) | null>(null);
  const requestedTab = searchParams.get('tab');
  const activeTab = numberingPlacementTabs.some((tab) => tab.value === requestedTab)
    ? requestedTab
    : 'gr-number';
  const handleTabChange = useCallback(
    (_event: unknown, value: string) => {
      if (value === requestedTab) return;

      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.set('tab', value);
      router.push(`${pathname}?${nextSearchParams.toString()}`, { scroll: false });
    },
    [pathname, requestedTab, router, searchParams]
  );

  return (
    <Stack spacing={1.25} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
      <CustomBreadcrumbs
        heading="Numbering & Placement"
        description="Create and publish GR series and Roll rules for Onboarding."
        tooltipProps={
          {
            title: (
              <OnboardingSettingsBreadcrumbInfo
                title="Numbering & Placement settings"
                description="Create and publish GR series and Roll rules for Onboarding."
                items={[
                  'Maintain GR identifier series and class-wise Roll number rules.',
                  'Published changes create new draft versions and preserve assigned numbers.',
                ]}
              />
            ),
            sx: { textAlign: 'left' },
          } as TooltipProps
        }
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Onboarding', href: studentPaths.onboarding.setup },
          { name: 'Settings', href: studentPaths.onboarding.settings },
          { name: 'Numbering & Placement' },
        ]}
      />
      <Paper variant="outlined" sx={{ overflow: 'hidden', flexShrink: 0 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <CustomTabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ '& .MuiTabs-flexContainer': { gap: 1 } }}
            >
              {numberingPlacementTabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={<Iconify icon={tab.icon} width={20} />}
                  iconPosition="start"
                  sx={{ minHeight: 44, py: 1 }}
                  id={`numbering-placement-tab-${tab.value}`}
                  aria-controls={`numbering-placement-panel-${tab.value}`}
                />
              ))}
            </CustomTabs>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'flex-end', sm: 'initial' },
              p: 1,
              flexShrink: 0,
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:plus" width={18} />}
              onClick={() => createActionRef.current?.()}
              sx={{ minWidth: 160, whiteSpace: 'nowrap' }}
            >
              {activeTab === 'gr-number'
                ? 'Add series'
                : activeTab === 'roll-number'
                  ? 'Add roll number rule'
                  : 'Add roll number rule'}
            </Button>
          </Box>
        </Stack>
      </Paper>
      <Box
        role="tabpanel"
        id={`numbering-placement-panel-${activeTab}`}
        aria-labelledby={`numbering-placement-tab-${activeTab}`}
        aria-label={numberingPlacementTabs.find((tab) => tab.value === activeTab)?.label}
        sx={{ minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {activeTab === 'gr-number' ? (
          <GrNumberSettingsScreen embedded showWorkspaceBar={false} createActionRef={createActionRef} />
        ) : null}
        {activeTab === 'roll-number' ? (
          <RollNumberSettingsScreen embedded showWorkspaceBar={false} createActionRef={createActionRef} />
        ) : null}
      </Box>
    </Stack>
  );
}
