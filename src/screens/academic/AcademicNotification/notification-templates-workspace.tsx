import type { AcademicNotificationCatalogueQueryState } from 'src/redux/academic-notifications/types';

import { Alert, Button, Skeleton } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { notificationEventLabel } from 'src/redux/academic-notifications/response-adapters';

import { NotificationFilterRow } from './Components/notification-filter-row';
import { NotificationTemplateList } from './Components/notification-template-list';

import type { useNotificationWorkspaceScope } from './use-notification-workspace-scope';
import type { useNotificationWorkspaceState } from './use-notification-workspace-state';

export function NotificationTemplatesWorkspace({ scope, filters, catalogue, actionTarget }: {
  scope: ReturnType<typeof useNotificationWorkspaceScope>;
  filters: ReturnType<typeof useNotificationWorkspaceState>;
  catalogue: AcademicNotificationCatalogueQueryState;
  actionTarget: HTMLElement | null;
}) {
  const events = catalogue.currentData?.events ?? [];
  const mediumId = scope.options.find((option) => option.scope.mediumId)?.scope.mediumId ?? undefined;
  const schoolAccess = scope.options.some((option) => option.value === 'school');
  const event = events.find((entry) => entry.definition.eventKey === filters.templateEvent) ?? events[0];
  const school = !mediumId || (filters.templateScope === 'school' && schoolAccess);
  const canManageMedium = scope.options.some((option) => option.value === 'medium');
  const id = school ? undefined : mediumId;
  const scopeLabel = school ? 'Whole school' : scope.contextLabel;
  const key = JSON.stringify([scope.identity, event?.definition.eventKey, id]);

  if (catalogue.isError || scope.error) return (
    <Alert severity="error" sx={{ mx: 1 }} action={<Button onClick={() => {
      if (catalogue.isError) catalogue.refetch();
      if (scope.error) scope.retry();
    }}>Retry</Button>}>Template events or scope could not be loaded.</Alert>
  );
  if (scope.isLoading || (catalogue.isFetching && !catalogue.currentData)) {
    return <Skeleton role="status" aria-label="Loading template events and scope" sx={{ mx: 1 }} height={56} />;
  }
  if (!event) return <Alert severity="info" sx={{ mx: 1 }}>No Academic notification events are available.</Alert>;

  return (
    <>
      <NotificationFilterRow>
        <CustomSelect label="Academic event" size="small" isSearch value={event.definition.eventKey}
          options={events.map((entry) => ({ value: entry.definition.eventKey, label: notificationEventLabel(entry) }))}
          onChange={(value) => filters.setFilters({ templateEvent: String(value) })} />
        {mediumId && schoolAccess && (
          <CustomSelect label="Template list scope" size="small" value={school ? 'school' : 'medium'}
            options={[{ value: 'medium', label: 'Current medium and school' }, { value: 'school', label: 'Whole school' }]}
            onChange={(value) => filters.setFilters({ templateScope: String(value) })} />
        )}
      </NotificationFilterRow>
      <NotificationTemplateList key={key} identity={scope.identity} event={event} academicMediumId={id}
        schoolAccess={schoolAccess} canManageMedium={canManageMedium} canManage={scope.canManage}
        canRemove={scope.canRemove} scopeLabel={scopeLabel} actionTarget={actionTarget} />
    </>
  );
}
