'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  RollNumberScope,
  RollNumberBatch,
  RollBatchOperation,
} from 'src/redux/student/onboarding/student-roll-number-batches-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Alert,
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

import { rollSortOptions, rollGroupingOptions } from '../setting/roll-ordering-fields';

type Props = {
  scope: RollNumberScope;
  operation?: RollBatchOperation;
  batchId?: string;
  onClose: () => void;
  onInteractionChange?: (active: boolean) => void;
};
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
}: Props) {
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
  const accept = (data: RollNumberBatch, nextPage = 0, nextSize = 25) => {
    if (
      data.academicYearId !== scope.academicYearId ||
      data.standardId !== scope.standardId ||
      data.divisionId !== scope.divisionId
    )
      throw new Error('The academic context changed. Close and open Roll Numbers again.');
    setBatch(data);
    setPage(nextPage);
    setPageSize(nextSize);
    if (data.status !== 'Preview')
      form.resetForm({ values: { reason: data.canDecide ? '' : data.reason } });
  };
  const showError = (issue: unknown) =>
    setError(
      parseApiProblemDetail(issue).detail ||
        'Roll numbering could not be completed. Refresh the preview before trying again.'
    );
  const generate = async (selected: RollBatchOperation) => {
    if (pending.current) return;
    pending.current = true;
    setError('');
    try {
      accept(await preview({ ...scope, operation: selected }).unwrap());
    } catch (issue) {
      showError(issue);
    } finally {
      pending.current = false;
    }
  };
  const read = async (id: string, nextPage = page, nextSize = pageSize) => {
    if (pending.current) return;
    pending.current = true;
    setError('');
    try {
      accept(
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
    }
  };
  async function command(action: 'submit' | 'approve' | 'reject' | 'apply') {
    if (!batch || pending.current || context.isError || error) return;
    pending.current = true;
    setError('');
    try {
      const common = {
        id: batch.id,
        concurrencyStamp: batch.concurrencyStamp,
        idempotencyKey: batch.idempotencyKey ?? batch.id,
        reason: form.values.reason.trim(),
      };
      const result = await (
        action === 'submit'
          ? submit(common)
          : action === 'apply'
            ? apply(common)
            : decide({
                id: batch.id,
                concurrencyStamp: batch.concurrencyStamp,
                approve: action === 'approve',
                reason: form.values.reason.trim(),
              })
      ).unwrap();
      accept(result);
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
  const label =
    batch?.operation === 'renumber' ? 'Renumber Division' : 'Assign Missing Roll Numbers';
  return (
    <>
      <CustomDialog
        open
        title={batch ? label : 'Manage Roll Numbers'}
        maxWidth="md"
        hasForm={false}
        handleClose={close}
        disableClose={busy}
        guardUnsavedChanges={false}
        hasUnsavedChanges={form.dirty}
      >
        <DialogScrollContent>
          <Stack spacing={1} aria-busy={busy}>
            {(busy || context.isFetching) && <LinearProgress aria-label="Loading roll numbering" />}
            <Typography variant="subtitle2">
              {batch?.scopeLabel || context.currentData?.scopeLabel}
            </Typography>
            {context.isError && (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={() => context.refetch()} disabled={busy}>
                    Retry
                  </Button>
                }
              >
                Roll numbering permissions could not be refreshed. Retry before continuing.
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
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
            {!batch && !busy && (
              <>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    disabled={
                      !context.currentData?.canAssignMissing ||
                      context.isFetching ||
                      context.isError
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
                  <Alert severity="warning">
                    {batch.blockedCount} student(s) need attention. Correct the flagged records,
                    then generate a new preview. No numbers have changed.
                  </Alert>
                )}
                {batch.status === 'PendingApproval' && (
                  <Alert severity="info">
                    School approval is required. The whole batch will be applied together after
                    approval.
                  </Alert>
                )}
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
        </DialogScrollContent>
        <DialogActions
          sx={{ p: 2, gap: 1, flexWrap: 'wrap', '& > :not(style) ~ :not(style)': { ml: 0 } }}
        >
          {batch && (
            <Button size="small" disabled={busy} onClick={() => read(batch.id)}>
              Refresh
            </Button>
          )}
          {batch?.status === 'Preview' && (
            <Button
              size="small"
              disabled={busy || context.isError}
              onClick={() => generate(batch.operation)}
            >
              New Preview
            </Button>
          )}
          <Button size="small" variant="outlined" color="inherit" disabled={busy} onClick={close}>
            Close
          </Button>
          {batch?.canDecide && (
            <>
              <Button
                size="small"
                variant="outlined"
                disabled={busy || context.isError || Boolean(error)}
                onClick={() => command('reject')}
              >
                Reject
              </Button>
              <Button
                size="small"
                variant="contained"
                color="inherit"
                disabled={busy || context.isError || Boolean(error)}
                onClick={() => command('approve')}
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
              onClick={() => form.submitForm()}
            >
              {batch.operation === 'renumber' ? 'Review Renumber' : 'Submit Assignment'}
            </Button>
          )}
        </DialogActions>
      </CustomDialog>
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
