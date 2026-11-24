import type { IParams } from 'src/components/customizabaleTable/types';
import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';
import type { AcademicNotificationEvent, AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Stack, Alert, Button, Typography } from '@mui/material';
import { notificationLabel, notificationEventLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';
import {
  useAcademicNotificationTemplatesQuery,
  useInitializeAcademicNotificationDefaultsMutation,
} from 'src/redux/academic-notifications/template-api';

import { templateRevisionStatus } from './notification-template-versions';
import { NotificationTemplateEditor } from './notification-template-editor';
import { notificationTemplateColumns } from './notification-template-columns';

export function NotificationTemplateList({
  identity, event, academicMediumId, schoolAccess, canManageMedium, canManage, canRemove, scopeLabel, actionTarget,
}: {
  identity: AcademicNotificationCacheIdentity;
  event: AcademicNotificationEvent;
  academicMediumId?: string;
  schoolAccess: boolean;
  canManageMedium: boolean;
  canManage: boolean;
  canRemove: boolean;
  scopeLabel: string;
  actionTarget: HTMLElement | null;
}) {
  const [page, setPage] = useState({ offset: 0, size: 10 });
  const [search, setSearch] = useState('');
  const [nameFilters, setNameFilters] = useState<IParams['filters']>([]);
  const [editing, setEditing] = useState<{ template?: AcademicNotificationTemplate }>();
  const [confirmStarterDrafts, setConfirmStarterDrafts] = useState(false);
  const [starterDraftsError, setStarterDraftsError] = useState('');
  const [initializeDefaults, { isLoading: initializing }] = useInitializeAcademicNotificationDefaultsMutation();
  const query = useAcademicNotificationTemplatesQuery({
    ...identity, eventKey: event.definition.eventKey, academicMediumId,
    skipCount: page.offset, maxResultCount: page.size, search: (nameFilters[0]?.value ?? search) || undefined,
  }, { refetchOnMountOrArgChange: true });
  const canCreate = canManage && (academicMediumId ? canManageMedium : schoolAccess);
  const canInitialize = canManage && schoolAccess;
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
      setNameFilters([]);
      setPage((current) => ({ ...current, offset: 0 }));
      shikshaMitraToast.success({ message: added === 1 ? '1 starter draft added.' : `${added} starter drafts added.` });
    } catch (error) {
      setStarterDraftsError(parseApiProblemDetail(error).detail || 'Starter drafts could not be added. Try again.');
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {actionTarget && (canInitialize || canCreate) && createPortal(
        <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="flex-end" sx={{ p: 1 }}>
          {canInitialize && (
            <Button size="small" color="inherit" variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.draftIcon} width={16} />}
              onClick={() => {
                setStarterDraftsError('');
                setConfirmStarterDrafts(true);
              }}>Add starter drafts</Button>
          )}
          {canCreate && (
            <Button size="small" color="inherit" variant="contained"
              startIcon={<Iconify icon={GlobalIcons.addIcon} width={16} />}
              onClick={() => setEditing({})}>New template</Button>
          )}
        </Stack>,
        actionTarget
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable tableId="academic-notification-templates" tableTitle="Academic notification templates"
          data={(query.currentData?.items ?? []).map((template) => ({
            ...template, id: template.templateId, template,
            recipient: notificationLabel(template.recipientKind), channelLabel: notificationChannelLabels[template.channel],
            scope: template.academicMediumId ? 'Current medium' : 'Whole school',
            revisionState: `V${template.revision} · ${templateRevisionStatus(template)}`,
          }))}
          columns={notificationTemplateColumns((template) => setEditing({ template }), query.isFetching)}
          showColumns showFullScreen showExport={false}
          searchFieldProps={{ placeholder: 'Search templates by name', inputProps: { 'aria-label': 'Search templates by name' } }}
          isLoading={query.isFetching && !query.currentData} isRefreshing={query.isFetching && Boolean(query.currentData)}
          error={query.error} onRetry={query.refetch}
          noDataText="No templates have been saved for this event and scope."
          searchTerm={search}
          serverSideSearch
          onServerSearch={(value) => {
            const term = value.trim().slice(0, 160);
            if (term === search) return;
            setSearch(term);
            setNameFilters([]);
            setPage((current) => ({ ...current, offset: 0 }));
          }}
          filters={nameFilters}
          onServerFilter={(criteria) => {
            const criterion = criteria.at(-1);
            const term = String(criterion?.value ?? '').trim().slice(0, 160);
            setNameFilters(criterion && term ? [{ ...criterion, value: term }] : []);
            setSearch('');
            setPage((current) => ({ ...current, offset: 0 }));
          }}
          onClearCriteria={() => {
            setNameFilters([]);
            setSearch('');
            setPage((current) => ({ ...current, offset: 0 }));
          }}
          serverSidePagination totalCount={query.currentData?.totalCount ?? 0} maxServerRowsPerPage={100}
          paginationDisabled={!query.currentData && query.isFetching}
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
