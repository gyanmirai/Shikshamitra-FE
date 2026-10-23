'use client';

import type { RootState } from 'src/redux/store';
import type {
  StudentDirectoryItem,
  RecordsLegacyOverride,
} from 'src/redux/student/records/student-records-types';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useGetStudentRecordsLegacyOverridesQuery,
  useGetStudentRecordsLegacyCandidatesQuery,
  useRejectStudentRecordsLegacyOverrideMutation,
  useRequestStudentRecordsLegacyOverrideMutation,
  useApproveStudentRecordsLegacyOverrideMutation,
} from 'src/redux/student/records/student-records-api';

export default function LegacyRecordEntry({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { permissions, user } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(permissions, 'Students.Records.Overrides.View');
  const canRequest = canView && hasGrantedPermission(permissions, 'Students.Records.Overrides.Add');
  const canApprove = canView && hasGrantedPermission(permissions, 'Students.Records.Overrides.Add');
  const [view, setView] = useState<'candidates' | 'requests'>(
    canRequest ? 'candidates' : 'requests'
  );
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<StudentDirectoryItem | null>(null);
  const [decision, setDecision] = useState<{ row: RecordsLegacyOverride; approve: boolean } | null>(
    null
  );
  const [remarks, setRemarks] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const candidates = useGetStudentRecordsLegacyCandidatesQuery(
    { skipCount: page * 10, maxResultCount: 10, search },
    { skip: !open || view !== 'candidates' || !canView }
  );
  const requests = useGetStudentRecordsLegacyOverridesQuery(
    { skipCount: page * 10, maxResultCount: 10 },
    { skip: !open || view !== 'requests' || !canView }
  );
  const [request, requestState] = useRequestStudentRecordsLegacyOverrideMutation();
  const [approve, approveState] = useApproveStudentRecordsLegacyOverrideMutation();
  const [reject, rejectState] = useRejectStudentRecordsLegacyOverrideMutation();
  const busy = requestState.isLoading || approveState.isLoading || rejectState.isLoading;
  const form = useFormik({
    initialValues: { reason: '', evidenceReference: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .min(10, 'Explain the historical entry in at least 10 characters.')
        .max(2000)
        .required('Enter a reason.'),
      evidenceReference: Yup.string().max(1000),
    }),
    onSubmit: async (values) => {
      if (!selected || !canRequest) return;
      setFailure(null);
      try {
        await request({
          studentId: selected.studentId,
          reason: values.reason.trim(),
          evidenceReference: values.evidenceReference.trim() || undefined,
        }).unwrap();
        shikshaMitraToast.success({
          message: 'Historical entry submitted. Another authorized staff member must approve it.',
        });
        setSelected(null);
        form.resetForm();
        setView('requests');
        setPage(0);
      } catch {
        setFailure(
          'This historical entry could not be submitted. The student may no longer be eligible or already have a request. Refresh and review the list.'
        );
      }
    },
  });
  const decide = async () => {
    if (!decision || !canApprove || decision.row.requestedByUserId === user?.sub) return;
    setFailure(null);
    try {
      const command = decision.approve ? approve : reject;
      await command({
        id: decision.row.id,
        concurrencyStamp: decision.row.concurrencyStamp,
        remarks: remarks.trim() || undefined,
      }).unwrap();
      setDecision(null);
      setRemarks('');
      shikshaMitraToast.success({
        message: decision.approve ? 'Historical entry approved.' : 'Historical entry rejected.',
      });
    } catch {
      setFailure(
        'This decision could not be applied. Refresh to check whether another reviewer already decided this request.'
      );
    }
  };
  const query = view === 'candidates' ? candidates : requests;
  return (
    <CustomDialog
      open={open}
      handleClose={() => {
        if (!busy) onClose();
      }}
      title="Historical student entry"
      maxWidth="md"
      hasForm={false}
      hasUnsavedChanges={form.dirty || Boolean(remarks)}
      disableClose={busy}
    >
      <DialogScrollContent>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Only verified historical enrollments without completed onboarding are eligible. Entry
            requires a reason and approval by a different staff member.
          </Typography>
          {failure && (
            <StudentFeedback notificationKey="STU-0796" presentation="persistent" severity="error">
              {failure}
            </StudentFeedback>
          )}
          {selected ? (
            <Box component="form" onSubmit={form.handleSubmit}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">
                  {[selected.firstName, selected.middleName, selected.lastName]
                    .filter(Boolean)
                    .join(' ') || 'Restricted student identity'}
                </Typography>
                <TextField
                  multiline
                  minRows={3}
                  label="Reason for historical entry"
                  name="reason"
                  value={form.values.reason}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  error={Boolean(form.touched.reason && form.errors.reason)}
                  helperText={form.touched.reason && form.errors.reason}
                  disabled={busy}
                />
                <TextField
                  label="Evidence reference (optional)"
                  name="evidenceReference"
                  value={form.values.evidenceReference}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  error={Boolean(form.touched.evidenceReference && form.errors.evidenceReference)}
                  helperText={form.touched.evidenceReference && form.errors.evidenceReference}
                  disabled={busy}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    onClick={() => {
                      setSelected(null);
                      form.resetForm();
                    }}
                    disabled={busy}
                  >
                    Back to candidates
                  </Button>
                  <Button variant="contained" type="submit" loading={requestState.isLoading}>
                    Submit for approval
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ) : decision ? (
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">
                {decision.approve ? 'Approve' : 'Reject'} historical entry
              </Typography>
              <Typography variant="body2">Reason: {decision.row.reason}</Typography>
              {decision.row.evidenceReference && (
                <Typography variant="body2">Evidence: {decision.row.evidenceReference}</Typography>
              )}
              <TextField
                label="Review remarks (optional)"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                multiline
                minRows={2}
                inputProps={{ maxLength: 2000 }}
                disabled={busy}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  disabled={busy}
                  onClick={() => {
                    setDecision(null);
                    setRemarks('');
                  }}
                >
                  Back to requests
                </Button>
                <Button
                  variant="contained"
                  color={decision.approve ? 'primary' : 'error'}
                  loading={busy}
                  onClick={decide}
                >
                  {decision.approve ? 'Approve entry' : 'Reject entry'}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Stack direction="row" spacing={1}>
                {canRequest && (
                  <Button
                    variant={view === 'candidates' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setView('candidates');
                      setPage(0);
                    }}
                  >
                    Eligible historical students
                  </Button>
                )}
                <Button
                  variant={view === 'requests' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setView('requests');
                    setPage(0);
                  }}
                >
                  Requests and decisions
                </Button>
              </Stack>
              {query.isError && (
                <StudentFeedback
                  notificationKey="STU-0797"
                  presentation="toast"
                  severity="error"
                  action={
                    <Button color="inherit" onClick={() => query.refetch()}>
                      Retry
                    </Button>
                  }
                >
                  Historical records could not be loaded.
                </StudentFeedback>
              )}
              {/* Bounded table is an embedded selection/history inside this dialog, not a primary workspace. */}
              <Box sx={{ height: 360, minHeight: 0 }}>
                {view === 'candidates' ? (
                  <CustomizableTable
                    tableId="records-legacy-candidates"
                    tableTitle="Eligible historical students"
                    data={candidates.currentData?.items ?? []}
                    totalCount={candidates.currentData?.totalCount ?? 0}
                    isLoading={candidates.isLoading}
                    isFilter={false}
                    serverSidePagination
                    serverSideSearch
                    rowsPerPage={10}
                    page={page}
                    searchTerm={search}
                    onServerSearch={(value) => {
                      setSearch(value);
                      setPage(0);
                    }}
                    onServerPagination={(next) => setPage(next)}
                    rowsPerPageOptions={[10]}
                    wrapperProps={{ sx: { height: 1 } }}
                    tableContainerProps={{ sx: { height: 1 } }}
                    columns={[
                      {
                        id: 'name',
                        label: 'Student',
                        render: (_value, row) =>
                          [row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ') ||
                          'Restricted identity',
                      },
                      {
                        id: 'grNumber',
                        label: 'GR number',
                        render: (value, row) => value ?? row.grNo ?? '—',
                      },
                      { id: 'standardName', label: 'Class' },
                      {
                        id: 'action',
                        label: 'Action',
                        excludeFromExport: true,
                        render: (_value, row) => (
                          <Button
                            onClick={() => {
                              setSelected(row as StudentDirectoryItem);
                              setFailure(null);
                            }}
                          >
                            Request entry
                          </Button>
                        ),
                      },
                    ]}
                    noDataText="No eligible historical students match this search."
                  />
                ) : (
                  <CustomizableTable
                    tableId="records-legacy-requests"
                    tableTitle="Historical entry requests"
                    data={requests.currentData?.items ?? []}
                    totalCount={requests.currentData?.totalCount ?? 0}
                    isLoading={requests.isLoading}
                    isFilter={false}
                    isSearch={false}
                    serverSidePagination
                    rowsPerPage={10}
                    page={page}
                    onServerPagination={(next) => setPage(next)}
                    rowsPerPageOptions={[10]}
                    wrapperProps={{ sx: { height: 1 } }}
                    tableContainerProps={{ sx: { height: 1 } }}
                    columns={[
                      { id: 'reason', label: 'Reason', minWidth: 220 },
                      { id: 'status', label: 'Status' },
                      {
                        id: 'creationTime',
                        label: 'Requested',
                        render: (value) => fDateTime(value),
                      },
                      {
                        id: 'action',
                        label: 'Review',
                        excludeFromExport: true,
                        render: (_value, row) =>
                          row.status === 'Pending' && canApprove ? (
                            row.requestedByUserId === user?.sub ? (
                              <Typography variant="caption">Another reviewer required</Typography>
                            ) : (
                              <Stack direction="row" spacing={1}>
                                <Button
                                  onClick={() => {
                                    setDecision({
                                      row: row as RecordsLegacyOverride,
                                      approve: true,
                                    });
                                    setFailure(null);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  color="error"
                                  onClick={() => {
                                    setDecision({
                                      row: row as RecordsLegacyOverride,
                                      approve: false,
                                    });
                                    setFailure(null);
                                  }}
                                >
                                  Reject
                                </Button>
                              </Stack>
                            )
                          ) : (
                            '—'
                          ),
                      },
                    ]}
                    noDataText="No historical entry requests yet."
                  />
                )}
              </Box>
            </>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
