'use client';

import type { RootState } from 'src/redux/store';
import type { RecordSection } from 'src/redux/student/records/student-record-changes-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { RouterLink } from 'src/routes/components';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Tab,
  Stack,
  Alert,
  Paper,
  Button,
  TextField,
  Typography,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  useGetStudentRecordsDirectoryQuery,
  useGetStudentRecordsDirectoryOptionsQuery,
} from 'src/redux/student/records/student-records-api';
import {
  useGetStudentRecordChangeQuery,
  useGetStudentRecordChangesQuery,
  useGetStudentRecordSnapshotQuery,
  useDecideStudentRecordChangeMutation,
} from 'src/redux/student/records/student-record-changes-api';

import RecordChangeForm from './record-change-form';
import RecordPhotoPreview from './record-photo-preview';
import RecordsStudentPicker from './records-student-picker';
import StudentDuplicateReviews from './student-duplicate-reviews';
import { recordDiffValue, recordFieldLabel } from './record-diff';
import { recordsQueryUrl, positivePageValue } from './records-url-state';

export const changeSections: { value: RecordSection; label: string }[] = [
  { value: 'general', label: 'Name, identity, and contact' },
  { value: 'family', label: 'Family and guardians' },
  { value: 'communication', label: 'Communication addresses' },
  { value: 'additional', label: 'Additional details' },
  { value: 'medical', label: 'Medical details' },
  { value: 'bank', label: 'Bank details' },
  { value: 'previous-school', label: 'Previous school' },
  { value: 'placement', label: 'Class and division' },
  { value: 'status', label: 'Active or inactive status' },
  { value: 'photo', label: 'Student photo' },
];

export default function StudentRecordChanges() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(permissions, 'Students.Records.Changes.Create');
  const [decision, setDecision] = useState<'approve' | 'reject' | 'cancel' | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const [draftDirty, setDraftDirty] = useState(false);
  const navigationGuard = useUnsavedNavigation(draftDirty, { push: router.push });
  const page = positivePageValue(params.get('page'), 0, 100000);
  const status = params.get('status') ?? '';
  const studentId = params.get('student') ?? '';
  const detailId = params.get('request') ?? '';
  const duplicates = params.get('tab') === 'duplicates';
  const newMode = !duplicates && params.get('mode') === 'new';
  const section = changeSections.some((item) => item.value === params.get('section'))
    ? (params.get('section') as RecordSection)
    : 'general';
  const navigate = (values: Record<string, string | number | undefined>) =>
    router.push(recordsQueryUrl(pathname, params.toString(), values), { scroll: false });
  const update = (values: Record<string, string | number | undefined>) =>
    navigationGuard.requestNavigation(() => navigate(values));
  const list = useGetStudentRecordChangesQuery(
    {
      studentId: studentId || undefined,
      status: status || undefined,
      skipCount: page * 25,
      maxResultCount: 25,
    },
    { skip: newMode || duplicates }
  );
  const detail = useGetStudentRecordChangeQuery(detailId, { skip: !detailId });
  const snapshot = useGetStudentRecordSnapshotQuery(
    { studentId, section },
    { skip: !newMode || !studentId || !canCreate, refetchOnMountOrArgChange: true }
  );
  const [decide, decisionState] = useDecideStudentRecordChangeMutation();
  const current = detail.isError ? undefined : detail.currentData;
  const canReadDirectory = hasGrantedPermission(permissions, 'Students.Records.StudentList.View');
  const diffOptions = useGetStudentRecordsDirectoryOptionsQuery(
    { academicYearId: current?.academicYearId },
    {
      skip:
        !current || current.payloadMasked || current.section !== 'placement' || !canReadDirectory,
    }
  );
  const siblingChoices = useGetStudentRecordsDirectoryQuery(
    { population: 'All', maxResultCount: 100 },
    { skip: !current || current.payloadMasked || current.section !== 'family' || !canReadDirectory }
  );
  const siblingNames = Object.fromEntries(
    (siblingChoices.currentData?.items ?? []).map((student) => [
      student.studentId,
      [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
        'Restricted identity',
    ])
  );
  const submitDecision = async () => {
    if (!decision || !current || !decisionReason.trim()) return;
    setFailure(null);
    try {
      await decide({
        id: current.id,
        command: decision,
        concurrencyStamp: current.concurrencyStamp,
        reason: decisionReason.trim(),
      }).unwrap();
      setDecision(null);
      setDecisionReason('');
      shikshaMitraToast.success({ message: 'Review decision recorded.' });
    } catch {
      setFailure(
        'The decision could not be recorded. This request may have changed or need a different reviewer. Refresh and retry.'
      );
    }
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1.5 }}>
      <CustomBreadcrumbs
        heading="Changes & Approvals"
        description="Request changes, review differences, and track their application to student records."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'Changes & Approvals' },
        ]}
        action={
          canCreate && !newMode && !duplicates ? (
            <Button
              variant="contained"
              component={RouterLink}
              href={recordsQueryUrl(pathname, params.toString(), {
                mode: 'new',
                request: undefined,
              })}
            >
              Request change
            </Button>
          ) : newMode ? (
            <Button component={RouterLink} href={studentPaths.records.changes}>
              Back to requests
            </Button>
          ) : undefined
        }
      />
      <CustomTabs
        value={duplicates ? 'duplicates' : 'changes'}
        guardUnsavedChanges={false}
        aria-label="Record review views"
      >
        <Tab
          component={RouterLink}
          value="changes"
          label="Changes & Approvals"
          icon={<Iconify icon="mdi:account-edit-outline" />}
          iconPosition="start"
          id="record-review-tab-changes"
          aria-controls="record-review-panel"
          href={recordsQueryUrl(pathname, params.toString(), {
            tab: undefined,
            status: undefined,
            page: 0,
            mode: undefined,
            request: undefined,
          })}
        />
        <Tab
          component={RouterLink}
          value="duplicates"
          label="Duplicate reviews"
          icon={<Iconify icon="mdi:account-multiple-check-outline" />}
          iconPosition="start"
          id="record-review-tab-duplicates"
          aria-controls="record-review-panel"
          href={recordsQueryUrl(pathname, params.toString(), {
            tab: 'duplicates',
            status: undefined,
            page: 0,
            mode: undefined,
            request: undefined,
          })}
        />
      </CustomTabs>
      <Box
        role="tabpanel"
        id="record-review-panel"
        aria-labelledby={`record-review-tab-${duplicates ? 'duplicates' : 'changes'}`}
        sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {duplicates ? (
          <StudentDuplicateReviews
            studentId={studentId || undefined}
            status={status || undefined}
            page={page}
            onPage={(next) => update({ page: next })}
            onStatus={(next) => update({ status: next || undefined, page: 0 })}
          />
        ) : newMode ? (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Stack spacing={2}>
              {!canCreate ? (
                <Alert severity="info">
                  You do not have permission to create student record changes.
                </Alert>
              ) : (
                <>
                  {!studentId && (
                    <RecordsStudentPicker
                      onSelect={(student) =>
                        update({ student: student?.studentId, request: undefined })
                      }
                    />
                  )}
                  {studentId && (
                    <Typography variant="body2">
                      Student selected.{' '}
                      <Button
                        component={RouterLink}
                        href={`${studentPaths.records.studentList}?student=${encodeURIComponent(studentId)}`}
                      >
                        Open profile
                      </Button>
                      <Button onClick={() => update({ student: undefined })}>
                        Choose another student
                      </Button>
                    </Typography>
                  )}
                  <CustomSelect
                    label="Record section"
                    value={section}
                    options={changeSections}
                    onChange={(value) => update({ section: String(value) })}
                  />
                  {snapshot.isError && (
                    <Alert
                      severity="error"
                      action={
                        <Button color="inherit" onClick={() => snapshot.refetch()}>
                          Retry
                        </Button>
                      }
                    >
                      This section could not be opened for editing. Check provisioning access and
                      sensitive-field permissions.
                    </Alert>
                  )}
                  {studentId && snapshot.isFetching && !snapshot.currentData && (
                    <LinearProgress aria-label="Loading current student section" />
                  )}
                  {studentId && !snapshot.isError && snapshot.currentData && (
                    <RecordChangeForm
                      key={`${studentId}-${section}-${params.get('reload') ?? ''}`}
                      studentId={studentId}
                      onDirtyChange={setDraftDirty}
                      snapshot={snapshot.currentData}
                      correctsChangeId={params.get('corrects') ?? undefined}
                      onReload={() => update({ reload: crypto.randomUUID() })}
                      onSubmitted={(id) =>
                        navigate({ mode: undefined, request: id, corrects: undefined })
                      }
                    />
                  )}
                </>
              )}
            </Stack>
          </Box>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <CustomSelect
                  label="Request status"
                  value={status}
                  options={[
                    { value: '', label: 'All requests' },
                    ...[
                      'Pending',
                      'Approved',
                      'Scheduled',
                      'Applied',
                      'Conflict',
                      'Rejected',
                      'Cancelled',
                    ].map((value) => ({ value, label: value })),
                  ]}
                  onChange={(value) => update({ status: String(value), page: 0 })}
                />
                <Button onClick={() => update({ status: undefined, student: undefined, page: 0 })}>
                  Clear filters
                </Button>
              </Stack>
            </Paper>
            {list.isError && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" onClick={() => list.refetch()}>
                    Retry
                  </Button>
                }
              >
                Change requests could not be loaded.
              </Alert>
            )}
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <CustomizableTable
                tableId="student-record-changes"
                tableTitle="Student record changes"
                columns={[
                  { id: 'studentName', label: 'Student', minWidth: 170 },
                  {
                    id: 'section',
                    label: 'Record section',
                    render: (value) =>
                      changeSections.find((item) => item.value === value)?.label ?? value,
                  },
                  {
                    id: 'status',
                    label: 'Status',
                    render: (value) => (
                      <Label
                        color={
                          value === 'Applied'
                            ? 'success'
                            : ['Conflict', 'Rejected'].includes(value)
                              ? 'error'
                              : value === 'Pending'
                                ? 'warning'
                                : ['Scheduled', 'Approved'].includes(value)
                                  ? 'info'
                                  : 'default'
                        }
                      >
                        {value}
                      </Label>
                    ),
                  },
                  { id: 'reason', label: 'Reason', minWidth: 220 },
                  { id: 'creationTime', label: 'Requested', render: (value) => fDateTime(value) },
                  {
                    id: 'approvalCount',
                    label: 'Reviews',
                    render: (value, row) => `${value} / ${row.requiredApprovals}`,
                  },
                  {
                    id: 'actions',
                    label: 'Actions',
                    isSort: false,
                    isFilter: false,
                    align: 'right',
                    sticky: true,
                    stickyPosition: 'right',
                    excludeFromExport: true,
                    render: (_value, row) => (
                      <Button
                        component={RouterLink}
                        href={recordsQueryUrl(pathname, params.toString(), { request: row.id })}
                        aria-label={`Review change for ${row.studentName}`}
                      >
                        Review
                      </Button>
                    ),
                  },
                ]}
                data={list.currentData?.items ?? []}
                totalCount={list.currentData?.totalCount ?? 0}
                isLoading={list.isLoading}
                serverSidePagination
                isSearch={false}
                isFilter={false}
                page={page}
                rowsPerPage={25}
                rowsPerPageOptions={[25]}
                onServerPagination={(next) => update({ page: next })}
                wrapperProps={{ sx: { height: 1 } }}
                tableContainerProps={{ sx: { height: 1 } }}
                noDataText="No change requests match this view."
              />
            </Box>
          </>
        )}
      </Box>
      {navigationGuard.confirmation}
      <CustomDialog
        open={Boolean(detailId)}
        handleClose={() => update({ request: undefined })}
        title="Review student record change"
        hasUnsavedChanges={Boolean(decisionReason.trim())}
        disableClose={decisionState.isLoading}
        hasForm={false}
        maxWidth="md"
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            {detail.isError && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" onClick={() => detail.refetch()}>
                    Retry
                  </Button>
                }
              >
                This change request could not be loaded.
              </Alert>
            )}
            {!current && detail.isFetching && (
              <LinearProgress aria-label="Loading change request" />
            )}
            {current && (
              <>
                <Typography variant="subtitle2">
                  {current.studentName} · {current.status}
                </Typography>
                <Typography variant="body2">{current.reason}</Typography>
                <Typography variant="caption">
                  Effective: {fDateTime(current.effectiveAt)} · Reviews: {current.approvalCount}/
                  {current.requiredApprovals}
                </Typography>
                {current.exceptionCode && (
                  <Alert severity="warning">
                    This change needs attention before it can apply. Review the current student
                    record and submit a correction if necessary.
                  </Alert>
                )}
                {current.photoPreviewUrl && !current.payloadMasked && (
                  <RecordPhotoPreview studentId={current.studentId} uri={current.photoPreviewUrl} />
                )}
                {current.payloadMasked ? (
                  <Alert severity="info">
                    This request contains protected fields you cannot view.
                  </Alert>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <CustomizableTable
                      tableId={`record-change-diff-${current.id}`}
                      tableTitle="Proposed differences"
                      isSearch={false}
                      isFilter={false}
                      isPagination={false}
                      columns={[
                        { id: 'field', label: 'Field' },
                        { id: 'before', label: 'Current value' },
                        { id: 'proposed', label: 'Proposed value' },
                      ]}
                      data={Object.keys(current.proposed ?? {})
                        .filter(
                          (key) =>
                            JSON.stringify(current.before?.[key]) !==
                            JSON.stringify(current.proposed?.[key])
                        )
                        .map((key) => ({
                          id: key,
                          field: recordFieldLabel(key),
                          before: recordDiffValue(
                            key,
                            current.before?.[key],
                            diffOptions.currentData,
                            siblingNames
                          ),
                          proposed: recordDiffValue(
                            key,
                            current.proposed?.[key],
                            diffOptions.currentData,
                            siblingNames
                          ),
                        }))}
                      noDataText="No field differences."
                    />
                  </Box>
                )}
                {current.decisions.map((item, index) => (
                  <Typography key={index} variant="body2">
                    Stage {item.stage}: {item.decision} · {item.reason} ·{' '}
                    {fDateTime(item.creationTime)}
                  </Typography>
                ))}
                {failure && <Alert severity="error">{failure}</Alert>}
                {decision && (
                  <TextField
                    label="Decision reason"
                    value={decisionReason}
                    onChange={(event) => setDecisionReason(event.target.value)}
                    multiline
                    minRows={2}
                    inputProps={{ maxLength: 2000 }}
                    disabled={decisionState.isLoading}
                  />
                )}
              </>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          {!decision ? (
            <>
              {current?.canApprove &&
                hasGrantedPermission(permissions, 'Students.Records.Changes.Approve') && (
                  <>
                    <Button onClick={() => setDecision('reject')} color="error">
                      Reject
                    </Button>
                    <Button onClick={() => setDecision('approve')}>Approve stage</Button>
                  </>
                )}
              {current?.canCancel &&
                hasGrantedPermission(permissions, 'Students.Records.Changes.Cancel') && (
                  <Button onClick={() => setDecision('cancel')}>Cancel request</Button>
                )}
              {current?.status === 'Applied' && canCreate && (
                <Button
                  component={RouterLink}
                  href={recordsQueryUrl(pathname, '', {
                    mode: 'new',
                    student: current.studentId,
                    section: current.section,
                    corrects: current.id,
                  })}
                >
                  Request correction
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                disabled={decisionState.isLoading}
                onClick={() => {
                  setDecision(null);
                  setDecisionReason('');
                }}
              >
                Keep reviewing
              </Button>
              <Button
                variant="contained"
                loading={decisionState.isLoading}
                disabled={!decisionReason.trim()}
                onClick={submitDecision}
              >
                Confirm {decision}
              </Button>
            </>
          )}
          <Button
            disabled={decisionState.isLoading}
            onClick={() => {
              setDecision(null);
              setDecisionReason('');
              update({ request: undefined });
            }}
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}
