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
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Button, TextField, Typography } from '@mui/material';
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
  useEffect(() => {
    setPage(0);
    setSearch('');
    setFilters([]);
  }, [view]);
  const [review, setReview] = useState<{
    form: AdmissionForm;
    action: 'approve' | 'reject';
  } | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const isAdminOverride = Boolean(
    review &&
    actions.canOverrideMakerChecker &&
    actions.currentUserId &&
    review.form.approvalRequestedBy &&
    actions.currentUserId.toLowerCase() === review.form.approvalRequestedBy.toLowerCase()
  );
  const listQuery = useMemo(
    () => buildAdmissionFormListQuery({ page, rowsPerPage, search, filters, purpose }),
    [filters, page, purpose, rowsPerPage, search]
  );
  const query = useGetAdmissionFormsQuery(listQuery);
  const columns = createFormColumns({
    canManage: actions.canManage,
    canPublish: actions.canPublish,
    canDelete: actions.canDelete,
    canOverrideMakerChecker: actions.canOverrideMakerChecker,
    currentUserId: actions.currentUserId,
    onEdit: (form) => actions.edit(form.id),
    onClone: actions.requestClone,
    onValidate: (form) => actions.validate(form.id),
    onRequestApproval: actions.requestApproval,
    onApprove: (form) => setReview({ form, action: 'approve' }),
    onReject: (form) => setReview({ form, action: 'reject' }),
    onPublish: actions.requestPublish,
    onHistory: actions.showHistory,
    onCreateVersion: (form) => actions.createVersion(form.id),
    onArchive: (form) => actions.archive(form),
    onDelete: actions.requestDelete,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Form"
        description="Create and publish the inquiry and registration forms used across admissions."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Form' },
        ]}
        action={
          <Button
            size="small"
            variant="contained"
            disabled={!actions.canManage}
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => actions.create(purpose)}
          >
            Create form
          </Button>
        }
      />
      <ApplicationExperienceNavigation value={view} />
      {query.isError && <AdmissionQueryError onRetry={() => query.refetch()} />}
      <Box
        role="tabpanel"
        id={`application-experience-${view}-panel`}
        aria-labelledby={`application-experience-${view}-tab`}
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        <CustomizableTable
          tableId={`admission-forms-${view}`}
          tableTitle={`${view[0].toUpperCase()}${view.slice(1)} forms`}
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={query.data?.items ?? []}
          handleRowClick={(row) => actions.preview((row as AdmissionForm).id)}
          rowProps={(row) => ({
            tabIndex: 0,
            sx: { cursor: 'pointer' },
            onKeyDown: (event) => {
              if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                actions.preview((row as AdmissionForm).id);
              }
            },
          })}
          totalCount={query.data?.totalCount ?? 0}
          page={page}
          rowsPerPage={rowsPerPage}
          searchTerm={search}
          filters={filters}
          isLoading={query.isLoading || query.isFetching}
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
            setFilters(value);
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
        open={Boolean(review)}
        onClose={() => {
          setReview(null);
          setReviewComment('');
        }}
        icon={review?.action === 'reject' ? 'warning' : 'info'}
        title={
          isAdminOverride
            ? review?.action === 'reject'
              ? 'Request changes with admin override?'
              : 'Approve with admin override?'
            : review?.action === 'reject'
              ? 'Request changes?'
              : 'Approve this form?'
        }
        content={
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isAdminOverride
                ? 'You requested this approval. As an administrator, you can override the two-person review rule. Enter a reason; this override will be recorded in form history.'
                : review?.action === 'reject'
                  ? 'Explain what the form owner should update before requesting approval again.'
                  : 'Approval confirms that another authorized user reviewed this draft. It can then be published.'}
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={3}
              label={
                isAdminOverride
                  ? 'Override reason'
                  : review?.action === 'reject'
                    ? 'Required changes'
                    : 'Review note (optional)'
              }
              required={isAdminOverride || review?.action === 'reject'}
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
            />
          </Box>
        }
        action={
          <Button
            variant="contained"
            size="small"
            color={review?.action === 'reject' ? 'warning' : 'primary'}
            disabled={
              actions.approving ||
              actions.rejecting ||
              ((isAdminOverride || review?.action === 'reject') && !reviewComment.trim())
            }
            onClick={async () => {
              if (!review) return;
              const ok =
                review.action === 'approve'
                  ? await actions.approve(review.form, reviewComment)
                  : await actions.reject(review.form, reviewComment);
              if (ok) {
                setReview(null);
                setReviewComment('');
              }
            }}
          >
            {isAdminOverride
              ? review?.action === 'reject'
                ? 'Request changes with override'
                : 'Approve with override'
              : review?.action === 'reject'
                ? 'Request changes'
                : 'Approve form'}
          </Button>
        }
      />
      <ConfirmDialog
        open={Boolean(actions.pendingDelete)}
        onClose={actions.clearPendingDelete}
        icon="error"
        title="Delete form draft?"
        content="This permanently removes the unused draft and its sections and fields."
        action={
          <Button
            color="error"
            variant="contained"
            size="small"
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
