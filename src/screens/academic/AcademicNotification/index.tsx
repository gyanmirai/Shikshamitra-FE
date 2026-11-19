'use client';

import type { AcademicNotificationRuleRow } from 'src/redux/academic-notifications/response-adapters';

import { useState } from 'react';
import { Box, Alert, Button } from '@mui/material';
import { academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { notificationRuleRows } from 'src/redux/academic-notifications/response-adapters';
import {
  useAcademicNotificationRulesQuery,
  useAcademicNotificationCatalogueQuery,
} from 'src/redux/academic-notifications/api';

import { NotificationRulesTable } from './Components/notification-rules-table';
import { NotificationRuleDrawer } from './Components/notification-rule-drawer';
import { NotificationScopeFilter } from './Components/notification-scope-filter';
import { useNotificationWorkspaceScope } from './use-notification-workspace-scope';
import { useNotificationWorkspaceState } from './use-notification-workspace-state';

export default function AcademicNotificationScreen() {
  const scope = useNotificationWorkspaceScope();
  const filters = useNotificationWorkspaceState();
  const selection = scope.options.find((option) => option.value === filters.scopeKey) ??
    scope.options.find((option) => option.value === 'medium') ??
    scope.options.find((option) => option.value !== 'school') ?? scope.options[0];
  const contextKey = JSON.stringify([scope.identity, selection?.scope]);
  const [editor, setEditor] = useState<{ contextKey: string; row: AcademicNotificationRuleRow }>();
  const openRule = scope.canManage && editor?.contextKey === contextKey ? editor.row : undefined;
  const catalogue = useAcademicNotificationCatalogueQuery(scope.identity, { skip: !scope.canView });
  const rules = useAcademicNotificationRulesQuery({
    ...scope.identity,
    scope: selection?.scope ?? {},
    skipCount: 0,
    maxResultCount: 100,
  }, { skip: !scope.canView || !selection, refetchOnMountOrArgChange: true });
  const allRows = catalogue.currentData && rules.currentData
    ? notificationRuleRows(catalogue.currentData, rules.currentData) : [];
  const rows = allRows.filter((row) =>
    (filters.category.value === 'all' || filters.category.families.includes(row.event.definition.category)) &&
    (filters.status === 'all' || row.state === filters.status)
  );
  const loading = scope.isLoading ||
    Boolean(!catalogue.currentData && catalogue.isFetching) ||
    Boolean(!rules.currentData && rules.isFetching);
  const refreshing = !loading && Boolean(rules.isFetching || catalogue.isFetching);
  const error = catalogue.error ?? rules.error;

  function configureRule(row: AcademicNotificationRuleRow) {
    setEditor({ contextKey, row });
  }

  const rowAction = scope.canManage ? configureRule : undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Academic Notifications"
        description="Review which events notify students, guardians, and staff for the selected scope."
        links={[{ name: 'Academics', href: academicPaths.dashboard }, { name: 'Notifications' }]}
        sx={{ px: 1 }}
      />
      {!scope.canView && scope.permissionsInitialized && (
        <Alert severity="warning" sx={{ mx: 1 }}>You do not have access to Academic notification rules.</Alert>
      )}
      {scope.canView && (
        <>
          <NotificationScopeFilter
            category={filters.category.value} status={filters.status} scopeKey={selection?.value ?? ''}
            scopes={scope.options} contextLabel={selection?.value === 'school' ? '' : scope.contextLabel}
            disabled={Boolean(openRule)}
            onChange={filters.setFilters}
          />
          {scope.error && (
            <Alert severity="error" sx={{ mx: 1 }} action={<Button onClick={scope.retry}>Retry</Button>}>
              Academic scope could not be loaded.
            </Alert>
          )}
          {!scope.error && !selection && !scope.isLoading && (
            <Alert severity="info" sx={{ mx: 1 }}>
              Select an academic year, board, and medium you can access.
            </Alert>
          )}
          {!scope.error && (selection || scope.isLoading) && (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <NotificationRulesTable
                rows={rows} search={filters.search} loading={loading} refreshing={refreshing} error={error}
                filtered={filters.category.value !== 'all' || filters.status !== 'all'}
                onSearch={(search) => filters.setFilters({ search })}
                onClear={() => filters.setFilters({ category: 'all', status: 'all', search: '' })}
                onRetry={() => {
                  if (catalogue.error) catalogue.refetch();
                  if (rules.error) rules.refetch();
                }}
                onConfigure={rowAction}
              />
            </Box>
          )}
          {openRule && selection && (
            <NotificationRuleDrawer row={openRule} identity={scope.identity}
              scopeLabel={selection.label} onClose={() => setEditor(undefined)} />
          )}
        </>
      )}
    </Box>
  );
}
