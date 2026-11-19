'use client';

import { useId } from 'react';
import { Box, Tab, Alert } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NotificationRulesWorkspace } from './notification-rules-workspace';
import { NotificationHistoryWorkspace } from './notification-history-workspace';
import { useNotificationWorkspaceScope } from './use-notification-workspace-scope';
import { useNotificationWorkspaceState } from './use-notification-workspace-state';
import { NotificationTemplatesWorkspace } from './notification-templates-workspace';

export default function AcademicNotificationScreen() {
  const tabId = useId();
  const scope = useNotificationWorkspaceScope();
  const filters = useNotificationWorkspaceState();
  const { view } = filters;
  const description = {
    rules: 'Review which events notify students, guardians, and staff for the selected scope.',
    templates: 'Manage message templates by event, recipient, channel, and language.',
    history: 'Review delivery attempts and exclusions for an Academic record.',
  }[view];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs heading="Academic Notifications"
        description={description}
        links={[{ name: 'Academics', href: academicPaths.dashboard }, { name: 'Notifications' }]} sx={{ px: 1 }} />
      {!scope.canView && scope.permissionsInitialized && (
        <Alert severity="warning" sx={{ mx: 1 }}>You do not have access to Academic notification rules.</Alert>
      )}
      {scope.canView && (
        <>
          <CustomTabs value={filters.view} aria-label="Academic notification workspace" variant="scrollable"
            onChange={(_, nextView: string) => filters.setFilters({ view: nextView === 'rules' ? '' : nextView })}>
            <Tab label="Rules" value="rules" id={`${tabId}-rules`} aria-controls={`${tabId}-panel`} />
            <Tab label="Templates" value="templates" id={`${tabId}-templates`} aria-controls={`${tabId}-panel`} />
            <Tab label="Delivery History" value="history" id={`${tabId}-history`} aria-controls={`${tabId}-panel`} />
          </CustomTabs>
          <Box role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-${filters.view}`}
            sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {view === 'rules' && <NotificationRulesWorkspace scope={scope} filters={filters} />}
            {view === 'templates' && <NotificationTemplatesWorkspace scope={scope} filters={filters} />}
            {view === 'history' && <NotificationHistoryWorkspace key={JSON.stringify(scope.identity)}
              identity={scope.identity} canManage={scope.canManage} />}
          </Box>
        </>
      )}
    </Box>
  );
}
