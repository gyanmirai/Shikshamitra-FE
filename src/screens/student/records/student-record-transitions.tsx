'use client';

import type { RootState } from 'src/redux/store';
import type {
  StudentRenewal,
  StudentTransition,
  TransitionPreviewRow,
} from 'src/redux/student/records/student-record-transitions-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';
import { fDate, fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Tab,
  Stack,
  Paper,
  Button,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetStudentRecordRenewalsQuery,
  useGetStudentRecordTransitionsQuery,
  useUpdateStudentRecordRenewalMutation,
  useDecideStudentRecordTransitionMutation,
  useCorrectStudentRecordTransitionMutation,
} from 'src/redux/student/records/student-record-transitions-api';

import TransitionBatchForm from './transition-batch-form';
import ReturningStudentForm from './returning-student-form';
import RenewalPortalAccounts from './renewal-portal-accounts';
import { recordsQueryUrl, positivePageValue } from './records-url-state';

export default function StudentRecordTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(permissions, 'Students.Records.Transitions.Add');
  const canApprove = hasGrantedPermission(permissions, 'Students.Records.Transitions.Add');
  const canApply = hasGrantedPermission(permissions, 'Students.Records.Transitions.Add');
  const canCancel = hasGrantedPermission(permissions, 'Students.Records.Transitions.Add');
  const canViewApplications = hasGrantedPermission(
    permissions,
    'Students.Admissions.Applications.View'
  );
  const canViewInquiries = hasGrantedPermission(permissions, 'Students.Admissions.Inquiries.View');
  const view = ['new', 'renewals', 'return'].includes(params.get('view') ?? '')
    ? params.get('view')!
    : 'history';
  const page = positivePageValue(params.get('page'), 0, 100000);
  const status = params.get('status') ?? '';
  const update = (values: Record<string, string | number | undefined>) =>
    router.push(recordsQueryUrl(pathname, params.toString(), values), { scroll: false });
  const transitions = useGetStudentRecordTransitionsQuery(
    {
      status: status || undefined,
      studentId: params.get('student') || undefined,
      skipCount: page * 25,
      maxResultCount: 25,
    },
    { skip: view !== 'history' }
  );
  const renewals = useGetStudentRecordRenewalsQuery(
    { status: status || undefined, skipCount: page * 25, maxResultCount: 25 },
    { skip: view !== 'renewals' }
  );
  const [selected, setSelected] = useState<StudentTransition | null>(null);
  const [renewal, setRenewal] = useState<StudentRenewal | null>(null);
  const [portalDirty, setPortalDirty] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const [command, setCommand] = useState<
    'approve' | 'reject' | 'cancel' | 'apply' | 'correct' | 'confirm' | 'activate' | null
  >(null);
  const [reason, setReason] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const [correction, setCorrection] = useState<{
    row: TransitionPreviewRow;
    reason: string;
  } | null>(null);
  const [correctionKey, setCorrectionKey] = useState(() => crypto.randomUUID());
  const [decide, decideState] = useDecideStudentRecordTransitionMutation();
  const [correct, correctState] = useCorrectStudentRecordTransitionMutation();
  const [updateRenewal, renewalState] = useUpdateStudentRecordRenewalMutation();
  const busy =
    decideState.isLoading || correctState.isLoading || renewalState.isLoading || portalBusy;
  const close = () => {
    if (busy) return;
    setSelected(null);
    setRenewal(null);
    setCommand(null);
    setReason('');
    setFailure(null);
    setCorrection(null);
  };
  const runCommand = async (previewOnly = false) => {
    if (!command || !reason.trim()) return;
    if (command === 'cancel' ? !canCancel : !canCreate) return;
    setFailure(null);
    try {
      if (selected && command === 'correct') {
        const row = await correct({
          id: selected.id,
          concurrencyStamp: selected.concurrencyStamp,
          idempotencyKey: correctionKey,
          reason: reason.trim(),
          previewOnly,
        }).unwrap();
        if (previewOnly) {
          setCorrection({ row, reason });
          return;
        }
      } else if (selected && ['approve', 'reject', 'cancel', 'apply'].includes(command))
        await decide({
          id: selected.id,
          command: command as 'approve' | 'reject' | 'cancel' | 'apply',
          concurrencyStamp: selected.concurrencyStamp,
          remarks: reason.trim(),
        }).unwrap();
      else if (renewal && ['confirm', 'activate'].includes(command)) {
        const result = await updateRenewal({
          id: renewal.id,
          command: command as 'confirm' | 'activate',
          concurrencyStamp: renewal.concurrencyStamp,
          remarks: reason.trim(),
        }).unwrap();
        setRenewal(result);
        setCommand(null);
        setReason('');
        shikshaMitraToast.success({
          message:
            result.status === 'Completed' ? 'Annual renewal completed.' : 'Renewal progress saved.',
        });
        return;
      }
      shikshaMitraToast.success({
        message:
          command === 'correct'
            ? 'Correction submitted under school approval rules.'
            : 'Transition decision recorded.',
      });
      close();
    } catch {
      setFailure(
        'This action could not be completed. Refresh to check the current state, required review stage, and dependent records. Your reason has been kept.'
      );
    }
  };
  const list = view === 'renewals' ? renewals : transitions;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1.5 }}>
      <CustomBreadcrumbs
        heading="Year-End & Transitions"
        description="Review promotions, exits, annual renewals, and returning students with school rules."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'Year-End & Transitions' },
        ]}
      />
      <CustomTabs value={view} guardUnsavedChanges={false} aria-label="Student transition views">
        <Tab
          component={RouterLink}
          value="history"
          id="transitions-tab-history"
          aria-controls="transitions-panel-history"
          label="Transitions"
          icon={<Iconify icon="mdi:history" />}
          iconPosition="start"
          href={recordsQueryUrl(pathname, params.toString(), {
            view: undefined,
            page: 0,
            status: undefined,
          })}
        />
        <Tab
          component={RouterLink}
          value="renewals"
          id="transitions-tab-renewals"
          aria-controls="transitions-panel-renewals"
          label="Annual renewals"
          icon={<Iconify icon="mdi:calendar-sync" />}
          iconPosition="start"
          href={recordsQueryUrl(pathname, params.toString(), {
            view: 'renewals',
            page: 0,
            status: undefined,
          })}
        />
        {canCreate && (
          <Tab
            component={RouterLink}
            value="new"
            id="transitions-tab-new"
            aria-controls="transitions-panel-new"
            label="Prepare batch"
            icon={<Iconify icon="mdi:account-arrow-right-outline" />}
            iconPosition="start"
            href={recordsQueryUrl(pathname, params.toString(), {
              view: 'new',
              page: 0,
              status: undefined,
            })}
          />
        )}
        {canCreate && (
          <Tab
            component={RouterLink}
            value="return"
            id="transitions-tab-return"
            aria-controls="transitions-panel-return"
            label="Returning students"
            icon={<Iconify icon="mdi:account-convert" />}
            iconPosition="start"
            href={recordsQueryUrl(pathname, params.toString(), {
              view: 'return',
              page: 0,
              status: undefined,
            })}
          />
        )}
      </CustomTabs>
      {view === 'new' ? (
        <Box
          role="tabpanel"
          id={`transitions-panel-${view}`}
          aria-labelledby={`transitions-tab-${view}`}
          sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}
        >
          {canCreate ? (
            <TransitionBatchForm onSubmitted={() => update({ view: undefined, page: 0 })} />
          ) : (
            <StudentFeedback notificationKey="STU-0909" presentation="inline" severity="info">
              You do not have permission to create transitions.
            </StudentFeedback>
          )}
        </Box>
      ) : view === 'return' ? (
        <Box
          role="tabpanel"
          id={`transitions-panel-${view}`}
          aria-labelledby={`transitions-tab-${view}`}
          sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}
        >
          {canCreate ? (
            <ReturningStudentForm />
          ) : (
            <StudentFeedback notificationKey="STU-0910" presentation="inline" severity="info">
              You do not have permission to start a student return.
            </StudentFeedback>
          )}
        </Box>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <CustomSelect
              label="Status"
              value={status}
              options={[
                { value: '', label: 'All statuses' },
                ...(view === 'renewals'
                  ? ['PendingChecklist', 'Provisioning', 'Completed', 'Cancelled']
                  : [
                      'Submitted',
                      'Approved',
                      'Scheduled',
                      'AwaitingRenewal',
                      'AwaitingAdmission',
                      'Applied',
                      'Exception',
                      'Rejected',
                      'Cancelled',
                    ]
                ).map((value) => ({ value, label: value.replace(/([A-Z])/g, ' $1').trim() })),
              ]}
              onChange={(value) => update({ status: String(value), page: 0 })}
            />
            <Button onClick={() => update({ status: undefined, student: undefined, page: 0 })}>
              Clear filters
            </Button>
          </Paper>
          {list.isError && (
            <StudentFeedback
              notificationKey="STU-0911"
              presentation="toast"
              severity="error"
              action={
                <Button color="inherit" onClick={() => list.refetch()}>
                  Retry
                </Button>
              }
            >
              Student transitions could not be loaded.
            </StudentFeedback>
          )}
          <Box
            role="tabpanel"
            id={`transitions-panel-${view}`}
            aria-labelledby={`transitions-tab-${view}`}
            sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
          >
            {view === 'renewals' ? (
              <CustomizableTable
                tableId="student-record-renewals"
                tableTitle="Annual renewals"
                data={renewals.currentData?.items ?? []}
                totalCount={renewals.currentData?.totalCount ?? 0}
                isLoading={renewals.isLoading}
                isSearch={false}
                isFilter={false}
                serverSidePagination
                page={page}
                rowsPerPage={25}
                rowsPerPageOptions={[25]}
                onServerPagination={(next) => update({ page: next })}
                wrapperProps={{ sx: { height: 1 } }}
                tableContainerProps={{ sx: { height: 1 } }}
                columns={[
                  {
                    id: 'studentName',
                    label: 'Student',
                    render: (value, row) => (
                      <Button
                        component={RouterLink}
                        href={`${studentPaths.records.studentList}?student=${row.studentId}`}
                      >
                        {value || 'Open student profile'}
                      </Button>
                    ),
                  },
                  {
                    id: 'status',
                    label: 'Status',
                    render: (value) => (
                      <Label color={value === 'Completed' ? 'success' : 'default'}>{value}</Label>
                    ),
                  },
                  {
                    id: 'guardianReviewConfirmed',
                    label: 'Guardian review',
                    render: (value, row) =>
                      row.guardianReviewRequired
                        ? value
                          ? 'Confirmed'
                          : 'Required'
                        : 'Not required',
                  },
                  {
                    id: 'issues',
                    label: 'Checks',
                    render: (value) =>
                      value.length
                        ? `${value.length} checks need attention`
                        : 'No unresolved checks',
                  },
                  {
                    id: 'action',
                    label: 'Action',
                    sticky: true,
                    stickyPosition: 'right',
                    excludeFromExport: true,
                    render: (_value, row) => (
                      <Button onClick={() => setRenewal(row as StudentRenewal)}>
                        Review renewal
                      </Button>
                    ),
                  },
                ]}
                noDataText="No annual renewal cases match this view."
              />
            ) : (
              <CustomizableTable
                tableId="student-record-transitions"
                tableTitle="Student transitions"
                data={transitions.currentData?.items ?? []}
                totalCount={transitions.currentData?.totalCount ?? 0}
                isLoading={transitions.isLoading}
                isSearch={false}
                isFilter={false}
                serverSidePagination
                page={page}
                rowsPerPage={25}
                rowsPerPageOptions={[25]}
                onServerPagination={(next) => update({ page: next })}
                wrapperProps={{ sx: { height: 1 } }}
                tableContainerProps={{ sx: { height: 1 } }}
                columns={[
                  {
                    id: 'studentName',
                    label: 'Student',
                    render: (value, row) => (
                      <Button
                        component={RouterLink}
                        href={`${studentPaths.records.studentList}?student=${row.studentId}`}
                      >
                        {value || 'Open student profile'}
                      </Button>
                    ),
                  },
                  { id: 'outcome', label: 'Outcome' },
                  {
                    id: 'status',
                    label: 'Status',
                    render: (value) => (
                      <Label
                        color={
                          value === 'Applied'
                            ? 'success'
                            : value === 'Exception'
                              ? 'error'
                              : 'default'
                        }
                      >
                        {value}
                      </Label>
                    ),
                  },
                  { id: 'effectiveDate', label: 'Effective date', render: (value) => fDate(value) },
                  { id: 'reason', label: 'Reason', minWidth: 220 },
                  {
                    id: 'currentApprovalStage',
                    label: 'Reviews',
                    render: (value, row) => `${value} / ${row.approvalStageCount}`,
                  },
                  {
                    id: 'action',
                    label: 'Action',
                    sticky: true,
                    stickyPosition: 'right',
                    excludeFromExport: true,
                    render: (_value, row) => (
                      <Button
                        onClick={() => {
                          setSelected(row as StudentTransition);
                          setCorrectionKey(crypto.randomUUID());
                        }}
                      >
                        Review
                      </Button>
                    ),
                  },
                ]}
                noDataText="No transitions match this view."
              />
            )}
          </Box>
        </>
      )}
      <CustomDialog
        open={Boolean(selected || renewal)}
        handleClose={close}
        title={renewal ? 'Review annual renewal' : 'Review student transition'}
        hasForm={false}
        maxWidth="sm"
        disableClose={busy}
        hasUnsavedChanges={portalDirty || Boolean(reason.trim())}
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            {selected && (
              <>
                <Typography variant="subtitle2">
                  {selected.studentName || 'Student transition'} · {selected.outcome} ·{' '}
                  {selected.status}
                </Typography>
                <Typography variant="body2">{selected.reason}</Typography>
                <Typography variant="body2">Effective: {fDate(selected.effectiveDate)}</Typography>
                {selected.status === 'AwaitingAdmission' && (
                  <StudentFeedback notificationKey="STU-0912" presentation="inline" severity="info">
                    Records approval is complete. Finish Admissions and Onboarding before this
                    return becomes active.
                  </StudentFeedback>
                )}
                {selected.admissionInquiryId && canViewInquiries && (
                  <Button
                    component={RouterLink}
                    href={`${studentPaths.enrollment.inquiries}?inquiryId=${encodeURIComponent(selected.admissionInquiryId)}`}
                    disabled={busy}
                  >
                    Open admission inquiry
                  </Button>
                )}
                {selected.admissionApplicationId && canViewApplications && (
                  <Button
                    component={RouterLink}
                    href={`${studentPaths.enrollment.applications}/${selected.admissionApplicationId}`}
                    disabled={busy}
                  >
                    Open admission application
                  </Button>
                )}
                {selected.lastError && (
                  <StudentFeedback
                    notificationKey="STU-0913"
                    presentation="persistent"
                    severity="warning"
                  >
                    This transition needs attention before application. Review its required checks
                    and dependent records.
                  </StudentFeedback>
                )}
                {selected.history.map((event, index) => (
                  <Typography key={index} variant="body2">
                    {event.action} · {event.remarks} · {fDateTime(event.occurredAt)}
                  </Typography>
                ))}
              </>
            )}
            {renewal && (
              <>
                <Typography variant="subtitle2">
                  {renewal.studentName || 'Annual renewal'} · {renewal.status}
                </Typography>
                <Typography variant="body2">
                  Guardian review:{' '}
                  {renewal.guardianReviewRequired
                    ? renewal.guardianReviewConfirmed
                      ? 'Confirmed'
                      : 'Required'
                    : 'Not required'}
                </Typography>
                <Typography variant="body2">
                  Finance handoff: {renewal.financeRequired ? 'Required' : 'Not required'} · Portal
                  review: {renewal.portalReviewRequired ? 'Required' : 'Not required'}
                </Typography>
                {renewal.issues.map((issue, index) => (
                  <StudentFeedback
                    notificationKey="STU-0914"
                    presentation="persistent"
                    key={index}
                    severity="warning"
                  >
                    {issue.message}
                  </StudentFeedback>
                ))}
                <RenewalPortalAccounts
                  key={renewal.id}
                  renewal={renewal}
                  onDirtyChange={setPortalDirty}
                  onBusyChange={setPortalBusy}
                />
              </>
            )}
            {failure && (
              <StudentFeedback
                notificationKey="STU-0915"
                presentation="persistent"
                severity="error"
              >
                {failure}
              </StudentFeedback>
            )}
            {command && (
              <TextField
                label="Reason or review remarks"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setCorrection(null);
                }}
                multiline
                minRows={2}
                inputProps={{ maxLength: 1000 }}
                disabled={busy}
              />
            )}
            {correction && (
              <StudentFeedback
                notificationKey="STU-0916"
                presentation={correction.row.ready ? 'inline' : 'persistent'}
                severity={correction.row.ready ? 'info' : 'warning'}
              >
                {correction.row.ready
                  ? 'The correction preview passed. Submit it for the required review.'
                  : correction.row.issues.map((issue) => issue.message).join('; ')}
              </StudentFeedback>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          {!command ? (
            <>
              {selected?.canApprove && canApprove && (
                <>
                  <Button onClick={() => setCommand('reject')} color="error">
                    Reject
                  </Button>
                  <Button onClick={() => setCommand('approve')}>Approve stage</Button>
                </>
              )}
              {selected?.canCancel && canCancel && (
                <Button onClick={() => setCommand('cancel')}>Cancel transition</Button>
              )}
              {selected?.canCorrect && canCreate && (
                <Button onClick={() => setCommand('correct')}>Correct this operation</Button>
              )}
              {selected?.canApply && canApply && (
                <Button onClick={() => setCommand('apply')}>Apply or retry transition</Button>
              )}
              {renewal?.status === 'PendingChecklist' && canApply && (
                <>
                  <Button onClick={() => setCommand('confirm')}>Confirm reviewed details</Button>
                  <Button onClick={() => setCommand('activate')}>Activate renewal</Button>
                </>
              )}
              {renewal?.status === 'Provisioning' && canApply && (
                <Button onClick={() => setCommand('activate')}>Refresh required handoffs</Button>
              )}
            </>
          ) : (
            <>
              <Button
                disabled={busy}
                onClick={() => {
                  setCommand(null);
                  setReason('');
                  setCorrection(null);
                }}
              >
                Keep reviewing
              </Button>
              {command === 'correct' && (
                <Button
                  disabled={!reason.trim() || busy}
                  loading={correctState.isLoading}
                  onClick={() => runCommand(true)}
                >
                  Preview correction
                </Button>
              )}
              <Button
                variant="contained"
                disabled={
                  !reason.trim() ||
                  busy ||
                  (command === 'correct' &&
                    (!correction?.row.ready || correction.reason !== reason))
                }
                loading={busy}
                onClick={() => runCommand(false)}
              >
                {
                  {
                    correct: 'Submit correction',
                    approve: 'Approve transition',
                    reject: 'Reject transition',
                    cancel: 'Cancel transition',
                    apply: 'Apply transition',
                    confirm: 'Confirm renewal',
                    activate: 'Activate renewal',
                  }[command]
                }
              </Button>
            </>
          )}
          <Button disabled={busy} onClick={close}>
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}
