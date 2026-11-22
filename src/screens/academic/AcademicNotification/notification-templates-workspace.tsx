import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';
import type {
  AcademicNotificationEvent,
  AcademicNotificationCacheIdentity,
  AcademicNotificationCatalogueQueryState,
} from 'src/redux/academic-notifications/types';

import { useState } from 'react';
import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Stack, Alert, Button, Skeleton, Typography } from '@mui/material';
import { notificationLabel, notificationEventLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';
import {
  useAcademicNotificationTemplatesQuery,
  useInitializeAcademicNotificationDefaultsMutation,
} from 'src/redux/academic-notifications/template-api';

import { templateRevisionStatus } from './Components/notification-template-versions';
import { NotificationTemplateEditor } from './Components/notification-template-editor';

import type { useNotificationWorkspaceScope } from './use-notification-workspace-scope';
import type { useNotificationWorkspaceState } from './use-notification-workspace-state';

type WorkspaceScope = ReturnType<typeof useNotificationWorkspaceScope>;
type WorkspaceFilters = ReturnType<typeof useNotificationWorkspaceState>;

export function NotificationTemplatesWorkspace({ scope, filters, catalogue }: {
  scope: WorkspaceScope;
  filters: WorkspaceFilters;
  catalogue: AcademicNotificationCatalogueQueryState;
}) {
  const events = catalogue.currentData?.events ?? [];
  const mediumId = scope.options.find((option) => option.scope.mediumId)?.scope.mediumId ?? undefined;
  const schoolAccess = scope.options.some((option) => option.value === 'school');
  const event = events.find((entry) => entry.definition.eventKey === filters.templateEvent) ?? events[0];
  const selection = mediumId && (filters.templateScope !== 'school' || !schoolAccess) ? 'medium' : 'school';
  const school = selection === 'school';
  const canManageMedium = scope.options.some((option) => option.value === 'medium');
  const id = school ? undefined : mediumId;
  const scopeLabel = school ? 'Whole school' : scope.contextLabel;
  const key = JSON.stringify([scope.identity, event?.definition.eventKey, id]);

  if (catalogue.isError || scope.error) return (
    <Alert severity="error" sx={{ m: 1 }} action={<Button onClick={() => {
      if (catalogue.isError) catalogue.refetch();
      if (scope.error) scope.retry();
    }}>Retry</Button>}>Template events or scope could not be loaded.</Alert>
  );
  if (scope.isLoading || (catalogue.isFetching && !catalogue.currentData)) return <Skeleton sx={{ mx: 1 }} height={56} />;
  if (!event) return <Alert severity="info" sx={{ m: 1 }}>No Academic notification events are available.</Alert>;

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} gap={1} sx={{ p: 1 }}>
        <CustomSelect label="Academic event" size="small" isSearch value={event.definition.eventKey}
          options={events.map((entry) => ({ value: entry.definition.eventKey, label: notificationEventLabel(entry) }))}
          onChange={(value) => filters.setFilters({ templateEvent: String(value) })}
          sx={{ minWidth: 220 }} />
        {mediumId && schoolAccess && (
          <CustomSelect label="Template list scope" size="small" value={selection}
            options={[{ value: 'medium', label: 'Current medium and school' }, { value: 'school', label: 'Whole school' }]}
            onChange={(value) => filters.setFilters({ templateScope: String(value) })} sx={{ minWidth: 195 }} />
        )}
        <Typography variant="body2" color="text.secondary">{scopeLabel}</Typography>
      </Stack>
      <NotificationTemplateList key={key} identity={scope.identity} event={event} academicMediumId={id}
        schoolAccess={schoolAccess} canManageMedium={canManageMedium}
        canManage={scope.canManage} canRemove={scope.canRemove} scopeLabel={scopeLabel} />
    </>
  );
}

function NotificationTemplateList({
  identity, event, academicMediumId, schoolAccess, canManageMedium, canManage, canRemove, scopeLabel,
}: {
  identity: AcademicNotificationCacheIdentity;
  event: AcademicNotificationEvent;
  academicMediumId?: string;
  schoolAccess: boolean;
  canManageMedium: boolean;
  canManage: boolean;
  canRemove: boolean;
  scopeLabel: string;
}) {
  const [page, setPage] = useState({ offset: 0, size: 10 });
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<{ template?: AcademicNotificationTemplate }>();
  const [confirmStarterDrafts, setConfirmStarterDrafts] = useState(false);
  const [starterDraftsError, setStarterDraftsError] = useState('');
  const [initializeDefaults, { isLoading: initializing }] = useInitializeAcademicNotificationDefaultsMutation();
  const query = useAcademicNotificationTemplatesQuery({
    ...identity, eventKey: event.definition.eventKey, academicMediumId,
    skipCount: page.offset, maxResultCount: page.size, search: search || undefined,
  }, { refetchOnMountOrArgChange: true });
  const canCreate = canManage && (academicMediumId ? canManageMedium : schoolAccess);
  const canInitialize = canManage && schoolAccess;
  const columns: IColumn[] = [
    { id: 'templateName', label: 'Template', minWidth: 180, rowHeader: true },
    { id: 'recipient', label: 'Recipient', minWidth: 128 },
    { id: 'channelLabel', label: 'Channel', minWidth: 115 },
    { id: 'languageCode', label: 'Language', minWidth: 95 },
    { id: 'scope', label: 'Scope', minWidth: 110 },
    { id: 'revisionState', label: 'Latest version', minWidth: 135, render: (state) => <Label>{String(state)}</Label> },
    { id: 'actions', label: 'Actions', align: 'right', sticky: true, stickyPosition: 'right', render: (_, row) => (
      <Button size="small" disabled={query.isFetching} aria-label={`Open ${row.templateName}`}
        onClick={() => setEditing({ template: row.template })}>Open</Button>
    ) },
  ];
  const selectedScope = editing?.template ? editing.template.academicMediumId : academicMediumId ?? null;
  const writeScope = selectedScope ? canManageMedium : schoolAccess;

  async function addStarterDrafts() {
    setStarterDraftsError('');
    try {
      const added = await initializeDefaults({ ...identity, eventKey: event.definition.eventKey }).unwrap();
      setConfirmStarterDrafts(false);
      if (added === 0) {
        shikshaMitraToast.info({ message: 'No starter drafts added.' });
        return;
      }
      setSearch('');
      setPage((current) => ({ ...current, offset: 0 }));
      shikshaMitraToast.success({ message: added === 1 ? '1 starter draft added.' : `${added} starter drafts added.` });
    } catch (error) {
      setStarterDraftsError(parseApiProblemDetail(error).detail || 'Starter drafts could not be added. Try again.');
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {(canInitialize || canCreate) && (
        <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="flex-end" sx={{ px: 1, pb: 1 }}>
          {canInitialize && (
            <Button size="small" variant="outlined" onClick={() => {
              setStarterDraftsError('');
              setConfirmStarterDrafts(true);
            }}>Add starter drafts</Button>
          )}
          {canCreate && <Button size="small" variant="contained" onClick={() => setEditing({})}>New template</Button>}
        </Stack>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable tableId="academic-notification-templates" tableTitle="Academic notification templates"
          data={(query.currentData?.items ?? []).map((template) => ({
            ...template, id: template.templateId, template,
            recipient: notificationLabel(template.recipientKind), channelLabel: notificationChannelLabels[template.channel],
            scope: template.academicMediumId ? 'Current medium' : 'Whole school',
            revisionState: `V${template.revision} · ${templateRevisionStatus(template)}`,
          }))}
          columns={columns.map((column) => ({ ...column, isSort: false }))}
          showExport={false} isFilter={false} searchFieldProps={{ placeholder: 'Search templates by name' }}
          isLoading={query.isFetching && !query.currentData} isRefreshing={query.isFetching && Boolean(query.currentData)}
          error={query.error} onRetry={query.refetch}
          noDataText={search ? 'No templates match your search.' : 'No templates have been saved for this event and scope.'}
          searchTerm={search} serverSideSearch onServerSearch={(value) => {
            setSearch(value.trim().slice(0, 160));
            setPage((current) => ({ ...current, offset: 0 }));
          }}
          serverSidePagination totalCount={query.currentData?.totalCount ?? 0} maxServerRowsPerPage={100}
          page={Math.floor(page.offset / page.size)} rowsPerPage={page.size}
          onServerPagination={(next, size) => setPage({ offset: (next - 1) * size, size })}
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }} tableContainerProps={{ sx: { height: 1, minHeight: 0 } }} />
      </Box>
      {canInitialize && confirmStarterDrafts && (
        <ConfirmDialog open title="Add Starter Drafts" icon="info" onClose={() => setConfirmStarterDrafts(false)}
          content={<Stack gap={1.5}>
            <Typography variant="body2">
              Add English starter drafts for {notificationEventLabel(event)} for the whole school.
            </Typography>
            <Typography variant="body2">
              Existing templates keep their saved wording. Review and publish each draft when it’s ready.
            </Typography>
            {starterDraftsError && <Alert severity="error">{starterDraftsError}</Alert>}
          </Stack>}
          action={<Button variant="contained" loading={initializing} onClick={() => addStarterDrafts()}>Add starter drafts</Button>} />
      )}
      {editing && (
        <NotificationTemplateEditor event={event} identity={identity} initialTemplate={editing.template}
          academicMediumId={selectedScope} scopeLabel={selectedScope ? scopeLabel : 'Whole school'}
          canManage={canManage && writeScope} canDelete={canRemove && writeScope}
          onClose={() => {
            setEditing(undefined);
            query.refetch();
          }} />
      )}
    </Box>
  );
}
