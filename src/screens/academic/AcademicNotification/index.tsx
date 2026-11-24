'use client';

import { useId, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Tab, Alert, Paper } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useAcademicNotificationCatalogueQuery } from 'src/redux/academic-notifications/api';

import { NotificationRulesWorkspace } from './notification-rules-workspace';
import { NotificationHistoryWorkspace } from './notification-history-workspace';
import { useNotificationWorkspaceScope } from './use-notification-workspace-scope';
import { useNotificationWorkspaceState } from './use-notification-workspace-state';
import { NotificationTemplatesWorkspace } from './notification-templates-workspace';

const views = [
  { value: 'rules', label: 'Rules', icon: GlobalIcons.academicFieldSettings },
  { value: 'templates', label: 'Templates', icon: GlobalIcons.admissionDetails },
  { value: 'history', label: 'Delivery History', icon: GlobalIcons.history },
] as const;

export default function AcademicNotificationScreen() {
  const tabId = useId();
  const [workspaceActions, setWorkspaceActions] = useState<HTMLDivElement | null>(null);
  const scope = useNotificationWorkspaceScope();
  const filters = useNotificationWorkspaceState();
  const { view } = filters;
  const catalogue = useAcademicNotificationCatalogueQuery(scope.identity, {
    skip: !scope.canView,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const description = {
    rules: 'Review which events notify students, guardians, and staff for the selected scope.',
    templates: 'Manage message templates by event, recipient, channel, and language.',
    history: 'Review assigned approvals and delivery attempts for Academic notifications.',
  }[view];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: { xs: 'auto', md: 1 }, minHeight: 0, minWidth: 0, gap: 1 }}>
      <CustomBreadcrumbs
        heading="Academic Notifications"
        description={description}
        links={[{ name: 'Academics', href: academicPaths.dashboard }, { name: 'Notifications' }]}
        sx={{ px: 1 }}
      />
      {!scope.canView && scope.permissionsInitialized && (
        <Alert severity="warning" sx={{ mx: 1 }}>You do not have access to Academic notifications.</Alert>
      )}
      {scope.canView && (
        <>
          <Paper sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, borderRadius: 2 }}>
            <CustomTabs
              value={view}
              aria-label="Academic notification workspace"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              slotProps={{
                flexContainer: { gap: { xs: 0, sm: 1 } },
                tab: { px: { xs: 1, sm: 2 } },
              }}
              sx={{ flex: '1 1 26rem', minWidth: 0, borderRadius: 'inherit' }}
              onChange={(_, nextView: typeof view) => filters.setFilters({ view: nextView === 'rules' ? '' : nextView })}
            >
              {views.map(({ value, label, icon }) => (
                <Tab
                  key={value}
                  id={`${tabId}-${value}-tab`}
                  aria-controls={`${tabId}-${value}-panel`}
                  label={label}
                  value={value}
                  icon={<Iconify icon={icon} width={20} aria-hidden />}
                  iconPosition="start"
                />
              ))}
            </CustomTabs>
            <Box ref={setWorkspaceActions} sx={{ ml: 'auto', maxWidth: 1, '&:empty': { display: 'none' } }} />
          </Paper>
          {views.map(({ value }) => (
            <Box
              key={value}
              role="tabpanel"
              id={`${tabId}-${value}-panel`}
              aria-labelledby={`${tabId}-${value}-tab`}
              hidden={view !== value}
              sx={{ display: view === value ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0, gap: 1 }}
            >
              {view === 'rules' && value === view && (
                <NotificationRulesWorkspace scope={scope} filters={filters} catalogue={catalogue} />
              )}
              {view === 'templates' && value === view && (
                <NotificationTemplatesWorkspace scope={scope} filters={filters} catalogue={catalogue} actionTarget={workspaceActions} />
              )}
              {view === 'history' && value === view && (
                <NotificationHistoryWorkspace
                  key={JSON.stringify(scope.identity)}
                  identity={scope.identity}
                  canManage={scope.canManage}
                  catalogue={catalogue}
                  actionTarget={workspaceActions}
                />
              )}
            </Box>
          ))}
        </>
      )}
    </Box>
  );
}
