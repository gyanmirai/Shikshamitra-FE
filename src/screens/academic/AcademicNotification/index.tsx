'use client';

import { useId } from 'react';
import { Box, Tab, Alert } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NotificationRulesWorkspace } from './notification-rules-workspace';
import { useNotificationWorkspaceScope } from './use-notification-workspace-scope';
import { useNotificationWorkspaceState } from './use-notification-workspace-state';
import { NotificationTemplatesWorkspace } from './notification-templates-workspace';

export default function AcademicNotificationScreen() {
  const tabId = useId();
  const scope = useNotificationWorkspaceScope();
  const filters = useNotificationWorkspaceState();
  const templates = filters.view === 'templates';
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs heading="Academic Notifications"
        description={templates ? 'Manage message templates by event, recipient, channel, and language.'
          : 'Review which events notify students, guardians, and staff for the selected scope.'}
        links={[{ name: 'Academics', href: academicPaths.dashboard }, { name: 'Notifications' }]} sx={{ px: 1 }} />
      {!scope.canView && scope.permissionsInitialized && (
        <Alert severity="warning" sx={{ mx: 1 }}>You do not have access to Academic notification rules.</Alert>
      )}
      {scope.canView && (
        <>
          <CustomTabs value={filters.view} aria-label="Academic notification workspace" variant="scrollable"
            onChange={(_, view: string) => filters.setFilters({ view: view === 'rules' ? '' : view })}>
            <Tab label="Rules" value="rules" id={`${tabId}-rules`} aria-controls={`${tabId}-panel`} />
            <Tab label="Templates" value="templates" id={`${tabId}-templates`} aria-controls={`${tabId}-panel`} />
          </CustomTabs>
          <Box role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-${filters.view}`}
            sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {templates ? <NotificationTemplatesWorkspace scope={scope} filters={filters} />
              : <NotificationRulesWorkspace scope={scope} filters={filters} />}
          </Box>
        </>
      )}
    </Box>
  );
}
