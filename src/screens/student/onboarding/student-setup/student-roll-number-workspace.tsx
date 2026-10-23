'use client';

import type { ReactNode, FormEvent } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  RollNumberScope,
  RollNumberBatch,
  RollBatchOperation,
} from 'src/redux/student/onboarding/student-roll-number-batches-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  useLazyGetRollNumberBatchQuery,
  useApplyRollNumberBatchMutation,
  useSubmitRollNumberBatchMutation,
  useDecideRollNumberBatchMutation,
  useGetRollNumberBatchContextQuery,
  usePreviewRollNumberBatchMutation,
} from 'src/redux/student/onboarding/student-roll-number-batches-api';

import StudentAssignmentDrawer from './student-assignment-drawer';
import { rollSortOptions, rollGroupingOptions } from '../setting/roll-ordering-fields';

type Props = {
  scope: RollNumberScope;
  operation?: RollBatchOperation;
  batchId?: string;
  onClose: () => void;
  onInteractionChange?: (active: boolean) => void;
  /** Explicit current-page targets. Never fall back to a whole-division preview. */
  caseIds?: string[];
  presentation?: 'drawer' | 'quick';
  onApplied?: (items: RollNumberBatch['items']) => void;
};
class RollBatchVerificationError extends Error {}
function RollAssignmentSurface({
  quick,
  children,
  actions,
  title,
  onClose,
  onSubmit,
  busy,
}: {
  quick: boolean;
  children: ReactNode;
  actions: ReactNode;
  title: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  busy: boolean;
}) {
  return quick ? (
    <CustomDialog
      open
      title={title}
      handleClose={onClose}
      maxWidth="sm"
      formProps={{ noValidate: true, onSubmit }}
      guardUnsavedChanges={false}
      disableClose={busy}
    >
      <DialogScrollContent>{children}</DialogScrollContent>
      {actions}
    </CustomDialog>
  ) : (
    <StudentAssignmentDrawer title={title} wide onClose={onClose} busy={busy} actions={actions}>
      {children}
    </StudentAssignmentDrawer>
  );
}
const columns: IColumn[] = [
  { id: 'studentName', label: 'Student', minWidth: 200, isFilter: false, isSort: false },
  {
    id: 'currentRollNumber',
    label: 'Current Roll',
    minWidth: 110,
    isFilter: false,
    isSort: false,
    render: (value) => value ?? '—',
  },
  {
    id: 'proposedRollNumber',
    label: 'Proposed Roll',
    minWidth: 110,
    isFilter: false,
    isSort: false,
    render: (value) => value ?? '—',
  },
  {
    id: 'issue',
    label: 'Status',
    minWidth: 220,
    sticky: true,
    stickyPosition: 'right',
    isFilter: false,
    isSort: false,
    render: (value, row) =>
      value ? (
        <Typography variant="body2" color="error.main">
          {value}
        </Typography>
      ) : (
        <Label color="success">{row.batchStatus === 'Applied' ? 'Applied' : 'Ready'}</Label>
      ),
  },
];

export default function StudentRollNumberWorkspace({
  scope,
  operation,
  batchId,
  onClose,
  onInteractionChange,
  caseIds,
  presentation = 'drawer',
  onApplied,
}: Props) {
  const quick = presentation === 'quick';
  const context = useGetRollNumberBatchContextQuery(scope);
  const [preview, previewState] = usePreviewRollNumberBatchMutation();
  const [load, loadState] = useLazyGetRollNumberBatchQuery();
  const [submit, submitState] = useSubmitRollNumberBatchMutation();
  const [decide, decideState] = useDecideRollNumberBatchMutation();
  const [apply, applyState] = useApplyRollNumberBatchMutation();
  const [batch, setBatch] = useState<RollNumberBatch>();
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [initializing, setInitializing] = useState(quick);
  const pending = useRef(false);
  const initialized = useRef(false);
  const form = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason:
        batch?.status === 'Preview' && (batch.operation === 'renumber' || batch.reasonRequired)
          ? Yup.string()
              .trim()
              .required(
                batch.operation === 'renumber'
                  ? 'Enter a reason for renumbering.'
                  : 'Enter a reason before saving.'
              )
              .max(1000)
          : Yup.string().trim().max(1000),
    }),
    onSubmit: async () => {
      if (!batch?.canSubmit || pending.current) return;
      if (batch.operation === 'renumber') setConfirmationOpen(true);
      else await command('submit');
    },
  });
  const busy =
    previewState.isLoading ||
    loadState.isFetching ||
    submitState.isLoading ||
    decideState.isLoading ||
    applyState.isLoading ||
    form.isSubmitting;
  const { requestNavigation, confirmation } = useUnsavedNavigation(
    form.dirty && (batch?.status === 'Preview' || Boolean(batch?.canDecide)),
    { blockNavigation: busy }
  );
  const close = () => {
    if (!pending.current && !busy) requestNavigation(onClose);
  };
  const verify = (data: RollNumberBatch) => {
    if (
      data.academicYearId !== scope.academicYearId ||
      data.standardId !== scope.standardId ||
      data.divisionId !== scope.divisionId
    )
      throw new RollBatchVerificationError(
        'The academic context changed. Close and open Roll Numbers again.'
      );
    if (
      caseIds &&
      (data.caseIds?.length !== caseIds.length || caseIds.some((id) => !data.caseIds?.includes(id)))
    )
      throw new RollBatchVerificationError(
        'The current-page assignment could not be verified. Refresh before trying again.'
      );
    if (quick && typeof data.approvalRequired !== 'boolean')
      throw new RollBatchVerificationError(
        'The school approval policy could not be verified. Refresh before trying again.'
      );
  };
  const accept = async (data: RollNumberBatch, nextPage = 0, nextSize = 25) => {
    verify(data);
    if (quick && data.status === 'Applied' && onApplied) {
      // Command responses contain only the first batch page. Read the rest once, not one case at a time.
      const applied =
        data.items.length < data.totalCount
          ? await load({ id: data.id, skipCount: 0, maxResultCount: 100 }, false).unwrap()
          : data;
      verify(applied);
      if (
        applied.id !== data.id ||
        applied.status !== 'Applied' ||
        applied.items.length !== applied.totalCount
      )
        throw new RollBatchVerificationError(
          'Saved Roll numbers could not be refreshed. Refresh to load the assignment result.'
        );
      onApplied(applied.items);
    }
    setBatch(data);
    setPage(nextPage);
    setPageSize(nextSize);
    if (data.status !== 'Preview')
      form.resetForm({ values: { reason: data.canDecide ? '' : data.reason } });
    if (quick && data.status === 'Applied') onClose();
  };
  const showError = (issue: unknown) =>
    setError(
      (issue instanceof RollBatchVerificationError
        ? issue.message
        : parseApiProblemDetail(issue).detail) ||
        'Roll numbering could not be completed. Refresh the preview before trying again.'
    );
  const generate = async (selected: RollBatchOperation) => {
    if (pending.current) return;
    pending.current = true;
    setError('');
    if (quick) setInitializing(true);
    try {
      const proposed = await preview({
        ...scope,
        operation: selected,
        ...(caseIds ? { caseIds } : {}),
      }).unwrap();
      await accept(proposed);
      // Ordinary Auto does not open a second surface. Policy requirements still need review.
      if (
        quick &&
        proposed.canSubmit &&
        proposed.status === 'Preview' &&
        !proposed.reasonRequired &&
        proposed.approvalRequired === false
      ) {
        await executeCommand('submit', proposed, '');
      }
    } catch (issue) {
      showError(issue);
    } finally {
      pending.current = false;
      setInitializing(false);
    }
  };
  const read = async (id: string, nextPage = page, nextSize = pageSize) => {
    if (pending.current) return;
    pending.current = true;
    setError('');
    try {
      await accept(
        await load(
          { id, skipCount: nextPage * nextSize, maxResultCount: nextSize },
          false
        ).unwrap(),
        nextPage,
        nextSize
      );
    } catch (issue) {
      showError(issue);
    } finally {
      pending.current = false;
      setInitializing(false);
    }
  };
  async function executeCommand(
    action: 'submit' | 'approve' | 'reject' | 'apply',
    target: RollNumberBatch,
    reason: string
  ) {
    const common = {
      id: target.id,
      concurrencyStamp: target.concurrencyStamp,
      idempotencyKey: target.idempotencyKey ?? target.id,
      reason,
    };
    const result = await (
      action === 'submit'
        ? submit(common)
        : action === 'apply'
          ? apply(common)
          : decide({
              id: target.id,
              concurrencyStamp: target.concurrencyStamp,
              approve: action === 'approve',
              reason,
            })
    ).unwrap();
    await accept(result);
    setConfirmationOpen(false);
    shikshaMitraToast.success({
      message:
        result.status === 'Applied'
          ? 'Division roll numbers saved.'
          : result.status === 'PendingApproval'
            ? 'Roll numbering is awaiting school approval. No numbers have changed.'
            : result.status === 'Approved'
              ? 'Batch approved. An authorized operator can apply it.'
              : 'Batch rejected. No numbers have changed.',
    });
  }
  async function command(action: 'submit' | 'approve' | 'reject' | 'apply') {
    if (!batch || pending.current || context.isError || error) return;
    pending.current = true;
    setError('');
    try {
      await executeCommand(action, batch, form.values.reason.trim());
    } catch (issue) {
      showError(issue);
      setConfirmationOpen(false);
    } finally {
      pending.current = false;
    }
  }
  useEffect(() => {
    onInteractionChange?.(true);
    return () => onInteractionChange?.(false);
  }, [onInteractionChange]);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (batchId) {
      read(batchId, 0, 25);
    } else if (operation) {
      generate(operation);
    }
    // One initial request per mounted workspace; explicit actions own subsequent previews/reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const label = batch?.operation === 'renumber' ? 'Renumber Division' : 'Auto Roll Numbers';
  if (quick && batch?.status === 'Applied') return null;
  if (quick && initializing && !error) {
    return <LinearProgress aria-label="Assigning current-page roll numbers" />;
  }
  return (
    <>
      <RollAssignmentSurface
        quick={quick}
        title={quick ? 'Roll Number Policy' : batch ? label : 'Manage Roll Numbers'}
        onClose={close}
        onSubmit={(event) => {
          event.preventDefault();
          form.submitForm();
        }}
        busy={busy}
        actions={
          <DialogActions
            sx={{ p: 2, gap: 1, flexWrap: 'wrap', '& > :not(style) ~ :not(style)': { ml: 0 } }}
          >
            {batch && (
              <Button
                size="small"
                disabled={busy}
                onClick={() => {
                  setError('');
                  read(batch.id);
                }}
                startIcon={quick ? <Iconify icon={GlobalIcons.refresh} width={18} /> : undefined}
              >
                Refresh
              </Button>
            )}
            {batch?.status === 'Preview' && (
              <Button
                size="small"
                disabled={busy || context.isError}
                onClick={() => generate(batch.operation)}
                startIcon={quick ? <Iconify icon={GlobalIcons.refresh} width={18} /> : undefined}
              >
                New Preview
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              onClick={close}
              startIcon={quick ? <Iconify icon={GlobalIcons.cancel} width={18} /> : undefined}
            >
              Close
            </Button>
            {batch?.canDecide && (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={busy || context.isError || Boolean(error)}
                  onClick={() => command('reject')}
                  startIcon={quick ? <Iconify icon={GlobalIcons.cancel} width={18} /> : undefined}
                >
                  Reject
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="inherit"
                  disabled={busy || context.isError || Boolean(error)}
                  onClick={() => command('approve')}
                  startIcon={quick ? <Iconify icon={GlobalIcons.submit} width={18} /> : undefined}
                >
                  Approve Batch
                </Button>
              </>
            )}
            {batch?.canApply && (
              <Button
                size="small"
                variant="contained"
                color="inherit"
                loading={applyState.isLoading}
                disabled={busy || context.isError || Boolean(error)}
                onClick={() => command('apply')}
                startIcon={quick ? <Iconify icon={GlobalIcons.submit} width={18} /> : undefined}
              >
                Apply Approved Batch
              </Button>
            )}
            {batch?.status === 'Preview' && (
              <Button
                size="small"
                variant="contained"
                color="inherit"
                loading={submitState.isLoading}
                disabled={busy || !batch.canSubmit || context.isError || Boolean(error)}
                type={quick ? 'submit' : 'button'}
                onClick={quick ? undefined : () => form.submitForm()}
                startIcon={quick ? <Iconify icon={GlobalIcons.submit} width={18} /> : undefined}
              >
                {batch.operation === 'renumber' ? 'Review Renumber' : 'Submit Assignment'}
              </Button>
            )}
          </DialogActions>
        }
      >
        <Stack spacing={1} aria-busy={busy}>
          {(busy || context.isFetching) && <LinearProgress aria-label="Loading roll numbering" />}
          <Typography variant="subtitle2">
            {batch?.scopeLabel || context.currentData?.scopeLabel}
          </Typography>
          {context.isError && (
            <StudentFeedback
              notificationKey="STU-1038"
              presentation="toast"
              severity="error"
              action={
                <Button size="small" onClick={() => context.refetch()} disabled={busy}>
                  Retry
                </Button>
              }
            >
              Could not load roll numbering. Retry before continuing.
            </StudentFeedback>
          )}
          {error && (
            <StudentFeedback notificationKey="STU-1039" presentation="persistent" severity="error">
              {error}
            </StudentFeedback>
          )}
          {!batch && busy && (
            <Box sx={{ height: 360, minHeight: 0, display: 'flex' }}>
              <CustomizableTable
                tableId="student-roll-number-batch-loading"
                tableTitle="Roll Number Preview"
                columns={columns}
                data={[]}
                isLoading
                isSearch={false}
                isFilter={false}
                isPagination={false}
                wrapperProps={{ sx: { height: 1, minHeight: 0, flex: 1 } }}
                tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
              />
            </Box>
          )}
          {quick && !batch && !busy && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => generate('assign-missing')}
              startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
            >
              Retry
            </Button>
          )}
          {!quick && !batch && !busy && (
            <>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  size="small"
                  variant="contained"
                  color="inherit"
                  disabled={
                    !context.currentData?.canAssignMissing || context.isFetching || context.isError
                  }
                  onClick={() => generate('assign-missing')}
                >
                  Assign Missing
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  disabled={
                    !context.currentData?.canRenumber || context.isFetching || context.isError
                  }
                  onClick={() => generate('renumber')}
                >
                  Renumber Division
                </Button>
              </Stack>
              {context.currentData?.blockedReason && (
                <Typography variant="body2" color="text.secondary">
                  {context.currentData.blockedReason}
                </Typography>
              )}
              {(context.currentData?.batches ?? []).map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="body2">
                    {item.operation === 'renumber' ? 'Renumber Division' : 'Assign Missing'} ·{' '}
                    {item.totalCount} students
                    {item.creationTime && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        {fDateTime(item.creationTime)}
                      </Typography>
                    )}
                  </Typography>
                  <Label
                    color={
                      item.status === 'Applied'
                        ? 'success'
                        : item.status === 'Rejected'
                          ? 'error'
                          : 'warning'
                    }
                  >
                    {item.status === 'PendingApproval' ? 'Awaiting Approval' : item.status}
                  </Label>
                  <Button
                    size="small"
                    disabled={busy}
                    aria-label={`Review ${item.operation === 'renumber' ? 'renumber division' : 'assign missing'}${item.creationTime ? ` from ${fDateTime(item.creationTime)}` : ''}`}
                    onClick={() => read(item.id, 0, 25)}
                  >
                    Review
                  </Button>
                </Stack>
              ))}
            </>
          )}
          {batch && (
            <>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                <Label
                  color={
                    batch.status === 'Applied' ? 'success' : batch.blockedCount ? 'error' : 'info'
                  }
                >
                  {batch.status === 'PendingApproval' ? 'Awaiting Approval' : batch.status}
                </Label>
                <Typography variant="body2">{batch.totalCount} students</Typography>
                <Typography variant="caption" color="text.secondary">
                  {rollGroupingOptions.find((x) => x.value === batch.grouping)?.label} ·{' '}
                  {rollSortOptions.find((x) => x.value === batch.sortBy)?.label}
                  {batch.sortBy === 'studentName'
                    ? ` · ${batch.nameFormat === 'surname-first' ? 'Surname First' : 'First Name First'}`
                    : ''}{' '}
                  · {batch.sortDirection === 'ascending' ? 'Ascending' : 'Descending'}
                </Typography>
              </Stack>
              {batch.blockedCount > 0 && (
                <StudentFeedback
                  notificationKey="STU-1040"
                  presentation="persistent"
                  severity="warning"
                >
                  {batch.blockedCount} student(s) need attention. Correct the flagged records, then
                  generate a new preview. No numbers have changed.
                </StudentFeedback>
              )}
              {batch.status === 'PendingApproval' && (
                <StudentFeedback notificationKey="STU-1041" presentation="inline" severity="info">
                  School approval is required. The whole batch will be applied together after
                  approval.
                </StudentFeedback>
              )}
              {quick && (
                <FormSectionCard
                  title="School Policy"
                  icon={GlobalIcons.notebook}
                  descriptionTooltip="The published numbering and approval rules applied to this assignment."
                  contentSpacing={1}
                >
                  <Typography variant="body2">
                    {batch.reasonRequired ? 'Reason required' : 'Reason optional'}
                  </Typography>
                  <Typography variant="body2">
                    {batch.approvalRequired
                      ? 'School approval required'
                      : 'No school approval required'}
                  </Typography>
                  {batch.approvalStages?.map((roles, index) => (
                    <Typography key={index} variant="body2">
                      Approval {index + 1}: {roles.join(' / ')}
                    </Typography>
                  ))}
                </FormSectionCard>
              )}
              {!quick && (
                <Box sx={{ height: 360, minHeight: 0, display: 'flex' }}>
                  <CustomizableTable
                    tableId="student-roll-number-batch-preview"
                    tableTitle="Roll Number Preview"
                    columns={columns}
                    data={batch.items.map((item) => ({
                      ...item,
                      id: item.studentId,
                      batchStatus: batch.status,
                    }))}
                    isSearch={false}
                    isFilter={false}
                    isLoading={loadState.isFetching}
                    serverSidePagination
                    page={page}
                    rowsPerPage={pageSize}
                    totalCount={batch.totalCount}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    onServerPagination={(nextPage, size) => {
                      if (!busy) read(batch.id, size === pageSize ? nextPage - 1 : 0, size);
                    }}
                    wrapperProps={{ sx: { height: 1, minHeight: 0, flex: 1 } }}
                    tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
                    noDataText="No eligible students in this division."
                  />
                </Box>
              )}
              {quick &&
                batch.items
                  .filter((item) => item.issue)
                  .map((item) => (
                    <Typography key={item.studentId} variant="body2" color="error.main">
                      {item.studentName}: {item.issue}
                    </Typography>
                  ))}
              {(batch.status === 'Preview' || batch.canDecide || batch.reason) && (
                <ShakingTextField error={Boolean(form.touched.reason && form.errors.reason)}>
                  <TextField
                    size="small"
                    fullWidth
                    label={batch.canDecide ? 'Review note' : 'Reason'}
                    name="reason"
                    value={form.values.reason}
                    required={
                      batch.status === 'Preview' &&
                      (batch.operation === 'renumber' || batch.reasonRequired)
                    }
                    disabled={busy || (!batch.canDecide && batch.status !== 'Preview')}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    error={Boolean(form.touched.reason && form.errors.reason)}
                    helperText={form.touched.reason ? form.errors.reason : undefined}
                  />
                </ShakingTextField>
              )}
            </>
          )}
        </Stack>
      </RollAssignmentSurface>
      <ConfirmDialog
        open={confirmationOpen}
        title="Renumber This Division?"
        onClose={() => {
          if (!busy) setConfirmationOpen(false);
        }}
        disableCancel={busy}
        disableEscapeKeyDown={busy}
        content={`${batch?.totalCount ?? 0} students are included. Existing roll numbers will change after any required school approval. Historical submitted records will remain unchanged.`}
        action={
          <Button
            size="small"
            variant="contained"
            color="inherit"
            loading={submitState.isLoading}
            disabled={busy}
            onClick={() => command('submit')}
          >
            Confirm Renumber
          </Button>
        }
      />
      {confirmation}
    </>
  );
}
