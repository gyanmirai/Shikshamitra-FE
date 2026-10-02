'use client';

import type { RootState } from 'src/redux/store';
import type { AttendanceCorrection } from 'src/redux/student/attendance-management/types';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { fNumber } from 'src/utils/format-number';
import { formatDateOnly } from 'src/utils/date-only';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { attendanceError, attendanceStatus } from 'src/redux/student/attendance-management/types';
import {
  Box,
  Paper,
  Stack,
  Alert,
  Button,
  TextField,
  IconButton,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetAttendanceCorrectionsQuery,
  useDecideAttendanceCorrectionMutation,
} from 'src/redux/student/attendance-management/api';

import LeaveRequests from './leave-requests';
import { useAttendanceContext, AttendanceClassFilters } from '../setting/attendance-context';

const creditLabel = (value: number | null | undefined) =>
  value == null ? 'Unavailable' : fNumber(value, { maximumFractionDigits: 6 });

export default function LeaveAndCorrections() {
  const context = useAttendanceContext();
  const isCorrections = context.params.get('view') === 'corrections';
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Leave & Corrections"
        description="Manage student leave and review attendance corrections. Approved leave never automatically marks a student present."
        links={[
          { name: 'Student', href: '/student/dashboard' },
          { name: 'Attendance', href: '/student/attendance/take-attendance' },
          { name: 'Leave & Corrections' },
        ]}
      />
      <Paper
        component="nav"
        aria-label="Leave and corrections views"
        variant="outlined"
        sx={{ p: 1 }}
      >
        <Stack direction="row" spacing={1}>
          {[
            { value: 'leaves', label: 'Leave requests' },
            { value: 'corrections', label: 'Attendance corrections' },
          ].map((item) => {
            const params = new URLSearchParams(context.params.toString());
            params.set('view', item.value);
            return (
              <Button
                key={item.value}
                component={RouterLink}
                href={`/student/attendance/leave-absent?${params.toString()}`}
                variant={
                  (isCorrections ? 'corrections' : 'leaves') === item.value ? 'contained' : 'text'
                }
                aria-current={
                  (isCorrections ? 'corrections' : 'leaves') === item.value ? 'page' : undefined
                }
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Paper>
      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {isCorrections ? (
          <Corrections />
        ) : (
          <>
            <AttendanceClassFilters context={context} />
            <LeaveRequests
              scope={{
                academicYearId: context.currentYear?.id,
                standardId: context.standardId || undefined,
                divisionId: context.divisionId || undefined,
              }}
            />
          </>
        )}
      </Box>
    </Box>
  );
}
function Corrections() {
  const context = useAttendanceContext();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canWrite = hasGrantedPermission(permissions, 'Students.Attendance.LeaveAndAbsent.Add');
  const page = Math.max(0, Number(context.params.get('page')) || 0);
  const state = context.params.get('state') || 'Pending';
  const query = useGetAttendanceCorrectionsQuery(
    {
      academicYearId: context.currentYear?.id ?? '',
      standardId: context.standardId || undefined,
      divisionId: context.divisionId || undefined,
      status: state || undefined,
      skipCount: page * 50,
      maxResultCount: 50,
    },
    { skip: !context.currentYear?.id }
  );
  const [decide, deciding] = useDecideAttendanceCorrectionMutation();
  const [target, setTarget] = useState<{
    correction: AttendanceCorrection;
    action: 'approve' | 'reject';
  } | null>(null);
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string().trim().required('Enter a review reason').max(500),
    }),
    onSubmit: async (values, helpers) => {
      if (!target) return;
      try {
        await decide({
          id: target.correction.id,
          action: target.action,
          reason: values.reason,
          revision: target.correction.revision,
        }).unwrap();
        helpers.resetForm();
        setTarget(null);
        shikshaMitraToast.success({
          message: target.action === 'approve' ? 'Correction approved.' : 'Correction rejected.',
        });
      } catch (error) {
        shikshaMitraToast.error({
          message: attendanceError(
            error,
            'Correction could not be reviewed. Your reason is retained.'
          ),
        });
      }
    },
  });
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <AttendanceClassFilters context={context} />
      <CustomSelect
        size="small"
        label="Correction state"
        value={state}
        options={['Pending', 'Applied', 'Approved', 'Rejected'].map((value) => ({
          value,
          label: value,
        }))}
        onChange={(value) => context.update({ state: String(value), page: undefined })}
      />
      {!context.currentYear?.id && (
        <Alert severity="info">Select an academic year to view corrections.</Alert>
      )}
      {query.isError && (
        <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
          {attendanceError(query.error, 'Attendance corrections could not be loaded.')}
        </Alert>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="attendance-corrections"
          tableTitle="Attendance correction requests"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={query.isLoading}
          data={query.currentData?.items ?? []}
          totalCount={query.currentData?.totalCount ?? 0}
          serverSidePagination
          isSearch={false}
          isFilter={false}
          page={page}
          rowsPerPage={50}
          rowsPerPageOptions={[50]}
          onServerPagination={(next) => context.update({ page: String(next - 1) })}
          noDataText="No correction requests match this academic year and state."
          columns={[
            { id: 'studentName', label: 'Student', minWidth: 180 },
            { id: 'date', label: 'Attendance date', filterType: 'date' },
            { id: 'beforeStatus', label: 'Recorded', render: (value) => attendanceStatus(value) },
            {
              id: 'requestedStatus',
              label: 'Requested',
              render: (value, row) => (
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography variant="body2">
                    {attendanceStatus(value)}
                    {row.late && ' · Late'}
                    {row.halfDay && ' · Half-day'}
                  </Typography>
                  {row.isCreditCorrection && <Label color="info">Leave credit update</Label>}
                </Stack>
              ),
            },
            { id: 'reason', label: 'Request reason', minWidth: 220 },
            {
              id: 'status',
              label: 'State',
              sticky: true,
              render: (value) => (
                <Label
                  color={
                    value === 'Pending' ? 'warning' : value === 'Rejected' ? 'error' : 'success'
                  }
                >
                  {value}
                </Label>
              ),
            },
            {
              id: 'actions',
              label: 'Review',
              sticky: true,
              stickyPosition: 'right',
              isSort: false,
              isFilter: false,
              excludeFromExport: true,
              render: (_, row) =>
                row.status === 'Pending' && canWrite ? (
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      aria-label={`Approve correction for ${row.studentName}`}
                      title={`Approve correction for ${row.studentName}`}
                      onClick={() => {
                        formik.resetForm();
                        setTarget({ correction: row as AttendanceCorrection, action: 'approve' });
                      }}
                    >
                      <Iconify icon="mdi:check-circle-outline" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Reject correction for ${row.studentName}`}
                      title={`Reject correction for ${row.studentName}`}
                      onClick={() => {
                        formik.resetForm();
                        setTarget({ correction: row as AttendanceCorrection, action: 'reject' });
                      }}
                    >
                      <Iconify icon="mdi:close-circle-outline" />
                    </IconButton>
                  </Stack>
                ) : (
                  '—'
                ),
            },
          ]}
        />
      </Box>
      <CustomDialog
        open={Boolean(target)}
        title={
          target?.action === 'approve'
            ? 'Approve attendance correction'
            : 'Reject attendance correction'
        }
        handleClose={() => {
          if (!deciding.isLoading) {
            setTarget(null);
            formik.resetForm();
          }
        }}
        maxWidth="sm"
        disableClose={deciding.isLoading}
        hasUnsavedChanges={formik.dirty}
      >
        <DialogScrollContent>
          <Stack spacing={1}>
            <Typography variant="body2">
              {target?.correction.studentName} · {formatDateOnly(target?.correction.date)} ·{' '}
              {attendanceStatus(target?.correction.beforeStatus ?? 0)} →{' '}
              {attendanceStatus(target?.correction.requestedStatus ?? 0)}
            </Typography>
            {target?.correction.isCreditCorrection && (
              <Stack spacing={0.5} alignItems="flex-start">
                <Label color="info">Leave credit update</Label>
                <Typography variant="body2">
                  Expected attendance day credit:{' '}
                  {creditLabel(target.correction.beforeDenominatorCredit)} →{' '}
                  {creditLabel(target.correction.requestedDenominatorCredit)}
                </Typography>
                <Typography variant="body2">
                  Present credit: {creditLabel(target.correction.beforePresentCredit)} →{' '}
                  {creditLabel(target.correction.requestedPresentCredit)}
                </Typography>
                {[
                  target.correction.beforeDenominatorCredit,
                  target.correction.requestedDenominatorCredit,
                  target.correction.beforePresentCredit,
                  target.correction.requestedPresentCredit,
                ].some((value) => value == null) && (
                  <Typography variant="caption" color="text.secondary">
                    Unavailable credit values have no preserved evidence in this correction.
                  </Typography>
                )}
              </Stack>
            )}
            <Typography variant="body2">Requested reason: {target?.correction.reason}</Typography>
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={2}
              label="Review reason"
              name="reason"
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.reason && Boolean(formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            disabled={deciding.isLoading}
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => {
              setTarget(null);
              formik.resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            loading={deciding.isLoading}
            variant="contained"
            startIcon={
              <Iconify
                icon={target?.action === 'approve' ? 'mdi:check' : 'mdi:close-circle-outline'}
              />
            }
            disabled={deciding.isLoading || !canWrite}
            onClick={() => formik.submitForm()}
          >
            {target?.action === 'approve' ? 'Approve correction' : 'Reject correction'}
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}
