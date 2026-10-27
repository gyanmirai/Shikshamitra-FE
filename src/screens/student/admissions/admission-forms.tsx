'use client';

import type { IParams } from 'src/components/customizabaleTable/types';
import type {
  AdmissionForm,
  AdmissionFormPurpose,
} from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Button, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';

import { createFormColumns } from './form-list/form-columns';
import { AdmissionFormDialog } from './admission-form-dialog';
import { AdmissionQueryError } from './admission-query-error';
import { useFormListActions } from './form-list/use-form-list-actions';
import { AdmissionFormCloneDialog } from './admission-form-clone-dialog';
import { buildAdmissionFormListQuery } from './form-list/form-list-query';
import { AdmissionFormPublishDialog } from './admission-form-publish-dialog';
import { AdmissionFormHistoryDialog } from './admission-form-history-dialog';
import { normalizeAdmissionFormFilters } from './form-list/form-column-filters';
import { ApplicationExperienceNavigation } from './application-experience-navigation';

import type { ApplicationExperienceView } from './application-experience-navigation';

const FORM_PURPOSES: Record<ApplicationExperienceView, AdmissionFormPurpose> = {
  inquiry: 0,
  registration: 1,
};
const VIEWS: ApplicationExperienceView[] = ['inquiry', 'registration'];

export default function AdmissionFormsScreen() {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get('view') as ApplicationExperienceView | null;
  const view = requestedView && VIEWS.includes(requestedView) ? requestedView : 'inquiry';
  const purpose = FORM_PURPOSES[view];
  const actions = useFormListActions();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<IParams['filters']>([]);
  const [filterScope, setFilterScope] = useState(view);
  const scopeChanging = filterScope !== view;
  useEffect(() => {
    setPage(0);
    setSearch('');
    setFilters([]);
    setFilterScope(view);
  }, [view]);
  const listQuery = useMemo(
    () => buildAdmissionFormListQuery({ page, rowsPerPage, search, filters, purpose }),
    [filters, page, purpose, rowsPerPage, search]
  );
  const query = useGetAdmissionFormsQuery(listQuery, { skip: scopeChanging });
  const currentData = scopeChanging ? undefined : query.currentData;
  const listError = !scopeChanging && query.isError;
  const hasSafeRows = Boolean(currentData?.items.length);
  const columns = createFormColumns({
    canManage: actions.canManage,
    canPublish: actions.canPublish,
    canDelete: actions.canDelete,
    onEdit: (form) => actions.edit(form.id),
    onClone: actions.requestClone,
    onValidate: (form) => actions.validate(form.id),
    onPublish: actions.requestPublish,
    onHistory: actions.showHistory,
    onCreateVersion: (form) => actions.createVersion(form.id),
    onArchive: (form) => actions.archive(form),
    onDelete: actions.requestDelete,
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: 1,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <CustomBreadcrumbs
        heading="Admission forms"
        description="Create and publish the inquiry and registration forms used across admissions."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission forms' },
        ]}
        slotProps={{
          action: { alignSelf: { xs: 'flex-end', md: 'center' }, maxWidth: '100%' },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        action={
          <Button
            size="small"
            variant="contained"
            disabled={!actions.canManage}
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => actions.create(purpose)}
          >
            Add form
          </Button>
        }
      />
      <ApplicationExperienceNavigation value={view} />
      {listError && hasSafeRows && <AdmissionQueryError onRetry={() => query.refetch()} />}
      <Box
        role="tabpanel"
        id={`application-experience-${view}-panel`}
        aria-labelledby={`application-experience-${view}-tab`}
        sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}
      >
        <CustomizableTable
          tableId={`admission-forms-${view}`}
          tableTitle={`${view[0].toUpperCase()}${view.slice(1)} forms`}
          wrapperProps={{ sx: { flex: 1, height: 1, minHeight: 0, minWidth: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={currentData?.items ?? []}
          errorContent={
            listError && !hasSafeRows ? (
              <AdmissionQueryError onRetry={() => query.refetch()} />
            ) : undefined
          }
          handleRowClick={(row) => actions.preview((row as AdmissionForm).id)}
          rowProps={(row) => ({
            tabIndex: 0,
            sx: { cursor: 'pointer' },
            onKeyDown: (event) => {
              if (
                event.target === event.currentTarget &&
                (event.key === 'Enter' || event.key === ' ')
              ) {
                event.preventDefault();
                actions.preview((row as AdmissionForm).id);
              }
            },
          })}
          totalCount={currentData?.totalCount ?? 0}
          page={page}
          rowsPerPage={rowsPerPage}
          searchTerm={search}
          filters={filters}
          isLoading={scopeChanging || query.isLoading || (query.isFetching && !currentData)}
          isRefreshing={query.isFetching && Boolean(currentData)}
          isPagination
          isSearch
          isFilter
          serverSidePagination
          serverSideSearch
          serverSideFilter
          maxServerRowsPerPage={100}
          onServerPagination={(nextPage, nextRowsPerPage) => {
            setPage(Math.max(nextPage - 1, 0));
            setRowsPerPage(nextRowsPerPage);
          }}
          onServerSearch={(value) => {
            setSearch(value);
            setPage(0);
          }}
          onServerFilter={(value) => {
            setFilters(normalizeAdmissionFormFilters(value));
            setPage(0);
          }}
          onClearCriteria={() => {
            setSearch('');
            setFilters([]);
            setPage(0);
          }}
          noDataText={`No ${view} forms configured yet. Create a draft to begin.`}
        />
      </Box>
      <AdmissionFormDialog
        open={actions.dialog.value}
        onClose={actions.close}
        editingId={actions.editingId}
        editing={actions.editing}
        editingError={actions.editingError}
        onRetryEditing={actions.retryEditing}
        initialPurpose={actions.creatingPurpose}
        saving={actions.saving}
        onSave={actions.save}
        onPublishNow={actions.saveAndPublish}
      />
      <AdmissionFormCloneDialog
        source={actions.pendingClone}
        saving={actions.cloning}
        onClose={actions.clearPendingClone}
        onSave={actions.confirmClone}
      />
      <AdmissionFormPublishDialog
        form={actions.pendingPublish}
        issues={actions.publishIssues}
        validating={actions.validatingPublish}
        publishing={actions.publishing}
        onClose={actions.clearPendingPublish}
        onEdit={actions.editPendingPublish}
        onPublish={actions.confirmPublish}
      />
      <AdmissionFormHistoryDialog
        form={actions.historyForm}
        onClose={actions.closeHistory}
        onRestoreVersion={async (id) => {
          const restored = await actions.createVersion(id);
          if (restored) actions.closeHistory();
          return restored;
        }}
      />
      <ConfirmDialog
        open={Boolean(actions.pendingDelete)}
        onClose={actions.clearPendingDelete}
        disableCancel={actions.deleting}
        disableBackdropClick
        disableEscapeKeyDown={actions.deleting}
        aria-labelledby="admission-form-delete-title"
        aria-describedby="admission-form-delete-description"
        icon="error"
        title={
          <Box component="span" id="admission-form-delete-title">
            Delete form draft?
          </Box>
        }
        content={
          <Stack spacing={1.5}>
            <Typography variant="body2" id="admission-form-delete-description">
              Delete <strong>{actions.pendingDelete?.name}</strong> and its sections and fields?
            </Typography>

            {actions.deleteError && (
              <StudentFeedback notificationKey="STU-0070" presentation="inline" severity="error">
                {actions.deleteError}
              </StudentFeedback>
            )}
          </Stack>
        }
        action={
          <Button
            color="error"
            variant="contained"
            size="small"
            loading={actions.deleting}
            disabled={actions.deleting}
            startIcon={<Iconify icon="mdi:delete-outline" />}
            onClick={actions.confirmDelete}
          >
            Delete draft
          </Button>
        }
      />
    </Box>
  );
}
