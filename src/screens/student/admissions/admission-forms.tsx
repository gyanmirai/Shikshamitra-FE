'use client';

import type { IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { studentPaths } from 'src/constants/student-menu';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Paper, Stack, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetAdmissionFormQuery,
  useGetAdmissionFormsQuery,
} from 'src/redux/student/admissions/admission-forms-api';

import { createFormColumns } from './form-list/form-columns';
import { AdmissionFormDialog } from './admission-form-dialog';
import { AdmissionQueryError } from './admission-query-error';
import { useFormListActions } from './form-list/use-form-list-actions';
import { FormLifecycleDialog } from './form-list/form-lifecycle-dialog';
import { AdmissionFormCloneDialog } from './admission-form-clone-dialog';
import { AdmissionFormPublishDialog } from './admission-form-publish-dialog';
import { AdmissionFormHistoryDialog } from './admission-form-history-dialog';
import { normalizeAdmissionFormFilters } from './form-list/form-column-filters';
import { useFormLifecycleActions } from './form-list/use-form-lifecycle-actions';
import {
  buildAdmissionFormListQuery,
  getAdmissionFormPurposeFilter,
} from './form-list/form-list-query';
import {
  getAdmissionFormListReturnUrl,
  readAdmissionFormListReturnState,
} from './form-preview/form-preview-navigation';

export default function AdmissionFormsScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actions = useFormListActions();
  const lifecycle = useFormLifecycleActions(actions.canManage);
  const requestedRestoreId = searchParams.get('restoreForm');
  const restoreEntryHandled = useRef<string | null>(null);
  const restoreEntry = useGetAdmissionFormQuery(requestedRestoreId ?? '', {
    skip: !requestedRestoreId || !actions.canManage,
    refetchOnMountOrArgChange: true,
  });
  const requestLifecycle = lifecycle.request;
  useEffect(() => {
    if (!actions.canManage) return;
    const form = restoreEntry.currentData;
    if (!requestedRestoreId) {
      restoreEntryHandled.current = null;
      return;
    }
    if (
      restoreEntry.isFetching ||
      !form ||
      form.id !== requestedRestoreId ||
      restoreEntryHandled.current === requestedRestoreId
    )
      return;
    restoreEntryHandled.current = requestedRestoreId;
    if (form.status === 2) requestLifecycle('restore', form);
    const remaining = new URLSearchParams(searchParams.toString());
    remaining.delete('restoreForm');
    router.replace(
      `${studentPaths.enrollment.settings.forms}${remaining.size ? `?${remaining}` : ''}`,
      { scroll: false }
    );
  }, [
    requestedRestoreId,
    restoreEntry.currentData,
    restoreEntry.isFetching,
    requestLifecycle,
    router,
    searchParams,
    actions.canManage,
  ]);
  const [restoredState] = useState(() => readAdmissionFormListReturnState(searchParams));
  const [page, setPage] = useState(restoredState.page);
  const [rowsPerPage, setRowsPerPage] = useState(restoredState.rowsPerPage);
  const [search, setSearch] = useState(restoredState.search);
  const [filters, setFilters] = useState<IParams['filters']>(restoredState.filters);
  const preview = (id: string) =>
    actions.preview(
      id,
      getAdmissionFormListReturnUrl({
        page,
        rowsPerPage,
        search,
        filters,
      })
    );
  const listQuery = useMemo(
    () => buildAdmissionFormListQuery({ page, rowsPerPage, search, filters }),
    [filters, page, rowsPerPage, search]
  );
  const query = useGetAdmissionFormsQuery(listQuery);
  const { currentData } = query;
  const listError = query.isError;
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
    onArchive: (form) => lifecycle.request('archive', form),
    onRestore: (form) => lifecycle.request('restore', form),
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
        heading="Admission Forms"
        description="Create and Publish the Inquiry and Registration Forms Used Across Admissions."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Forms' },
        ]}
        slotProps={{
          action: { alignSelf: { xs: 'flex-end', md: 'center' }, maxWidth: '100%' },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        action={
          <Button
            aria-label="Add Form"
            size="small"
            variant="contained"
            disabled={!actions.canManage}
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => actions.create(0)}
          >
            Form
          </Button>
        }
      />
      <Paper
        component="section"
        aria-label="Admission Form Filters"
        variant="outlined"
        sx={{ p: 1, borderRadius: 2 }}
      >
        <CustomSelect
          name="formType"
          label="Form Type"
          size="small"
          value={getAdmissionFormPurposeFilter(filters) ?? 'all'}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 0, label: 'Inquiry' },
            { value: 1, label: 'Registration' },
          ]}
          formControlProps={{ sx: { width: { xs: '100%', sm: 180 } } }}
          onChange={(value) => {
            setFilters([
              ...filters.filter((filter) => filter.column !== 'purpose'),
              ...(value === 0 || value === 1
                ? [
                    {
                      column: 'purpose',
                      type: 'equals',
                      value,
                      valueType: 'enum',
                      label: 'Form Type',
                      displayValue: value === 0 ? 'Inquiry' : 'Registration',
                    },
                  ]
                : []),
            ]);
            setPage(0);
          }}
        />
      </Paper>
      {listError && hasSafeRows && <AdmissionQueryError onRetry={() => query.refetch()} />}
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admission-forms"
          tableTitle="Admission Forms"
          wrapperProps={{ sx: { flex: 1, height: 1, minHeight: 0, minWidth: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={currentData?.items ?? []}
          errorContent={
            listError && !hasSafeRows ? (
              <AdmissionQueryError onRetry={() => query.refetch()} />
            ) : undefined
          }
          handleRowClick={(row) => preview((row as AdmissionForm).id)}
          rowProps={(row) => ({
            tabIndex: 0,
            sx: { cursor: 'pointer' },
            onKeyDown: (event) => {
              if (
                event.target === event.currentTarget &&
                (event.key === 'Enter' || event.key === ' ')
              ) {
                event.preventDefault();
                preview((row as AdmissionForm).id);
              }
            },
          })}
          totalCount={currentData?.totalCount ?? 0}
          page={page}
          rowsPerPage={rowsPerPage}
          searchTerm={search}
          filters={filters}
          isLoading={query.isLoading || (query.isFetching && !currentData)}
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
            if (value === search) return;
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
          noDataText="No Admission Forms Configured Yet. Create a Draft to Begin."
        />
      </Box>
      <AdmissionFormDialog
        open={actions.dialog.value}
        onClose={actions.close}
        editingId={actions.editingId}
        editing={actions.editing}
        editingError={actions.editingError}
        onRetryEditing={actions.retryEditing}
        initialPurpose={
          actions.editingId
            ? (actions.editing?.purpose ??
              currentData?.items.find((form) => form.id === actions.editingId)?.purpose ??
              0)
            : actions.creatingPurpose
        }
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
        canRestore={actions.canPublish}
        onClose={actions.closeHistory}
        onRestoreVersion={async (id) => {
          if (!actions.canPublish) return false;
          const restored = await actions.createVersion(id);
          if (restored) actions.closeHistory();
          return restored;
        }}
      />
      <FormLifecycleDialog
        {...lifecycle}
        onClose={lifecycle.close}
        onConfirm={lifecycle.confirm}
        onReload={lifecycle.reloadLatest}
      />
      {lifecycle.queryError && <AdmissionQueryError onRetry={lifecycle.reloadLatest} />}
      {requestedRestoreId && restoreEntry.isError && (
        <AdmissionQueryError onRetry={restoreEntry.refetch} />
      )}
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
            Delete Draft
          </Button>
        }
      />
    </Box>
  );
}
