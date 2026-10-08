'use client';

import type { RootState } from 'src/redux/store';
import type { AttendanceSchedule } from 'src/redux/student/attendance-management/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { attendanceError } from 'src/redux/student/attendance-management/types';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Alert,
  Button,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  useGetAttendanceSchedulesQuery,
  useGetAttendanceEnrollmentsQuery,
  useConfirmAttendanceStartMutation,
  useSaveAttendanceScheduleMutation,
  useDeleteAttendanceScheduleMutation,
} from 'src/redux/student/attendance-management/api';

import { useAttendanceContext, AttendanceClassFilters } from './attendance-context';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const empty = (enrollmentId: string, academicYearId: string): AttendanceSchedule => ({
  enrollmentId,
  academicYearId,
  name: '',
  kind: 'Fixed',
  startDate: '',
  endDate: '',
  weekDays: [],
  startTime: '',
  endTime: '',
});
export default function IndividualSchedules({
  onBusyChange,
  onDirtyChange,
  requestNavigation,
}: {
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
  requestNavigation: (proceed: () => void) => void;
}) {
  const context = useAttendanceContext();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canRead = hasGrantedPermission(permissions, 'Students.Attendance.MarkAttendance.View');
  const canWrite = hasGrantedPermission(permissions, 'Students.Attendance.MarkAttendance.Add');
  const canDelete = hasGrantedPermission(permissions, 'Students.Attendance.MarkAttendance.Delete');
  const page = Math.max(0, Number(context.params.get('studentsPage')) || 0);
  const enrolled = useGetAttendanceEnrollmentsQuery(
    {
      academicYearId: context.currentYear?.id ?? '',
      standardId: context.standardId,
      divisionId: context.divisionId,
      skipCount: page * 50,
      maxResultCount: 50,
    },
    { skip: !canRead || !context.currentYear?.id || !context.standardId || !context.divisionId }
  );
  const enrollment = enrolled.currentData?.items.find(
    (item) => item.enrollmentId === context.params.get('student')
  );
  const schedules = useGetAttendanceSchedulesQuery(
    { enrollmentId: enrollment?.enrollmentId ?? '' },
    { skip: !enrollment }
  );
  const [confirmStart, confirming] = useConfirmAttendanceStartMutation();
  const [save, saving] = useSaveAttendanceScheduleMutation();
  const [remove, removing] = useDeleteAttendanceScheduleMutation();
  const busy = confirming.isLoading || saving.isLoading || removing.isLoading;
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceSchedule | null>(null);
  const [startDate, setStartDate] = useState('');
  const confirm = useBoolean();
  const formik = useFormik<AttendanceSchedule>({
    initialValues: empty('', context.currentYear?.id ?? ''),
    validationSchema: Yup.object({
      name: Yup.string().trim().required('Name this schedule').max(100),
      startDate: Yup.string().required('Choose a start date'),
      endDate: Yup.string()
        .test(
          'range',
          'End date must be on or after start date',
          (value, validation) => !value || value >= validation.parent.startDate
        )
        .when('kind', {
          is: 'Temporary',
          then: (schema) => schema.required('Temporary schedules need an end date'),
        }),
      weekDays: Yup.array().of(Yup.number().min(0).max(6)).min(1, 'Select expected weekdays'),
      endTime: Yup.string().test(
        'time',
        'End time must be after start time',
        (value, validation) =>
          (!value && !validation.parent.startTime) ||
          Boolean(value && validation.parent.startTime && value > validation.parent.startTime)
      ),
    }),
    onSubmit: async (values, helpers) => {
      if (!enrollment) return;
      try {
        await save({
          ...values,
          enrollmentId: enrollment.enrollmentId,
          academicYearId: context.currentYear?.id ?? '',
          endDate: values.endDate || null,
          startTime: values.startTime || null,
          endTime: values.endTime || null,
        }).unwrap();
        helpers.resetForm({
          values: empty(enrollment.enrollmentId, context.currentYear?.id ?? ''),
        });
        shikshaMitraToast.success({ message: 'Individual attendance schedule saved.' });
      } catch (error) {
        shikshaMitraToast.error({
          message: attendanceError(
            error,
            'Schedule could not be saved. Your changes are retained.'
          ),
        });
      }
    },
  });
  useEffect(() => {
    onDirtyChange(formik.dirty || Boolean(startDate));
    return () => onDirtyChange(false);
  }, [formik.dirty, startDate, onDirtyChange]);
  if (!canRead)
    return (
      <Alert severity="info">Individual schedules require Daily Attendance view access.</Alert>
    );
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <FormBusyRegion busy={busy} label="Saving individual schedule…">
        <Stack spacing={1}>
          <Typography variant="subtitle2">Individual attendance schedules</Typography>
          <Typography variant="body2" color="text.secondary">
            Students follow their class calendar by default. Configure only individual exceptions;
            completed approved shorter hours count as full Present.
          </Typography>
          <AttendanceClassFilters context={context} requireClass />
          {!context.currentYear?.id || !context.standardId || !context.divisionId ? (
            <Alert severity="info">
              Select the academic year, class and division to find an enrolled student.
            </Alert>
          ) : (
            <>
              {enrolled.isError && (
                <Alert
                  severity="error"
                  action={<Button onClick={() => enrolled.refetch()}>Retry</Button>}
                >
                  {attendanceError(enrolled.error, 'Students could not be loaded.')}
                </Alert>
              )}
              <CustomSelect
                fullWidth
                size="small"
                label="Enrolled student"
                isLoading={enrolled.isLoading}
                value={enrollment?.enrollmentId ?? ''}
                options={[
                  { value: '', label: 'Select student' },
                  ...(enrolled.currentData?.items ?? []).map((item) => ({
                    value: item.enrollmentId,
                    label: (item.rollNo ? `${item.rollNo}. ` : '') + item.fullName,
                  })),
                ]}
                onChange={(value) =>
                  requestNavigation(() => {
                    formik.resetForm({
                      values: empty(String(value), context.currentYear?.id ?? ''),
                    });
                    setStartDate('');
                    context.update({ student: String(value) });
                  })
                }
              />
              {(enrolled.currentData?.totalCount ?? 0) > 50 && (
                <Stack direction="row" spacing={1}>
                  <Button
                    disabled={page === 0}
                    onClick={() =>
                      context.update({ studentsPage: String(page - 1), student: undefined })
                    }
                  >
                    Previous students
                  </Button>
                  <Typography variant="caption">Page {page + 1}</Typography>
                  <Button
                    disabled={(page + 1) * 50 >= (enrolled.currentData?.totalCount ?? 0)}
                    onClick={() =>
                      context.update({ studentsPage: String(page + 1), student: undefined })
                    }
                  >
                    Next students
                  </Button>
                </Stack>
              )}
            </>
          )}
          {enrollment && (
            <>
              <Alert severity={enrollment.attendanceStartDate ? 'info' : 'warning'}>
                {enrollment.attendanceStartDate
                  ? `Attendance starts on ${dayjs(enrollment.attendanceStartDate).format(
                      'DD MMM YYYY'
                    )}`
                  : 'Attendance start date is not confirmed. This student will not be expected until the school confirms it.'}
              </Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Confirm attendance start date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  disabled={!canWrite}
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
                <Button
                  size="small"
                  disabled={!canWrite || !startDate || confirming.isLoading}
                  onClick={async () => {
                    try {
                      await confirmStart({
                        enrollmentId: enrollment.enrollmentId,
                        date: startDate,
                        revision: enrollment.revision,
                      }).unwrap();
                      setStartDate('');
                      shikshaMitraToast.success({ message: 'Attendance start date confirmed.' });
                    } catch (error) {
                      shikshaMitraToast.error({
                        message: attendanceError(error, 'Start date could not be confirmed.'),
                      });
                    }
                  }}
                >
                  Confirm start date
                </Button>
              </Stack>
              {schedules.isError && (
                <Alert
                  severity="error"
                  action={<Button onClick={() => schedules.refetch()}>Retry</Button>}
                >
                  {attendanceError(schedules.error, 'Schedules could not be loaded.')}
                </Alert>
              )}
              {(schedules.currentData?.items ?? []).map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 1 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.name} ·{' '}
                      {item.retiredFrom
                        ? `Historical (ended ${item.retiredFrom.slice(0, 10)})`
                        : item.kind}{' '}
                      · {item.startDate.slice(0, 10)} – {item.endDate?.slice(0, 10) || 'ongoing'} ·{' '}
                      {item.weekDays.map((day) => weekdays[day]).join(', ')}
                    </Typography>
                    <Button
                      size="small"
                      disabled={!canWrite || Boolean(item.retiredFrom)}
                      onClick={() =>
                        requestNavigation(() =>
                          formik.resetForm({
                            values: {
                              ...item,
                              startDate: item.startDate.slice(0, 10),
                              endDate: item.endDate?.slice(0, 10) ?? '',
                            },
                          })
                        )
                      }
                    >
                      Replace schedule
                    </Button>
                    <Button
                      color="error"
                      size="small"
                      disabled={!canDelete || removing.isLoading || Boolean(item.retiredFrom)}
                      onClick={() => {
                        setDeleteTarget(item);
                        confirm.onTrue();
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Paper>
              ))}
              {canWrite && (
                <Box component="form" onSubmit={formik.handleSubmit}>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Schedule name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CustomSelect
                        fullWidth
                        size="small"
                        label="Schedule type"
                        value={formik.values.kind}
                        options={[
                          { value: 'Fixed', label: 'Fixed weekdays' },
                          { value: 'Temporary', label: 'Temporary date range exception' },
                        ]}
                        onChange={(value) => formik.setFieldValue('kind', value)}
                      />
                    </Grid>
                    {(['startDate', 'endDate', 'startTime', 'endTime'] as const).map((field) => (
                      <Grid key={field} size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type={field.endsWith('Date') ? 'date' : 'time'}
                          label={
                            {
                              startDate: 'Effective from',
                              endDate: 'Effective until',
                              startTime: 'Expected start time (optional)',
                              endTime: 'Expected end time (optional)',
                            }[field]
                          }
                          name={field}
                          value={formik.values[field] || ''}
                          slotProps={{ inputLabel: { shrink: true } }}
                          onChange={formik.handleChange}
                          error={Boolean(formik.touched[field] && formik.errors[field])}
                          helperText={formik.touched[field] && formik.errors[field]}
                        />
                      </Grid>
                    ))}
                    <Grid size={{ xs: 12 }}>
                      <Stack direction="row" flexWrap="wrap">
                        {weekdays.map((label, day) => (
                          <FormControlLabel
                            key={label}
                            label={label}
                            control={
                              <Checkbox
                                checked={formik.values.weekDays.includes(day)}
                                onChange={(_, checked) =>
                                  formik.setFieldValue(
                                    'weekDays',
                                    checked
                                      ? [...formik.values.weekDays, day]
                                      : formik.values.weekDays.filter((value) => value !== day)
                                  )
                                }
                              />
                            }
                          />
                        ))}
                      </Stack>
                      {formik.errors.weekDays && (
                        <Typography variant="caption" color="error.main">
                          {String(formik.errors.weekDays)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                          disabled={saving.isLoading}
                          onClick={() =>
                            requestNavigation(() =>
                              formik.resetForm({
                                values: empty(
                                  enrollment.enrollmentId,
                                  context.currentYear?.id ?? ''
                                ),
                              })
                            )
                          }
                        >
                          Clear form
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          size="small"
                          loading={saving.isLoading}
                          disabled={saving.isLoading || !formik.dirty}
                        >
                          Save schedule
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </>
          )}
          <ConfirmDialog
            open={confirm.value}
            onClose={confirm.onFalse}
            title="Delete individual schedule?"
            content={`Delete ${
              deleteTarget?.name ?? ''
            }? The schedule will end from today. Historical attendance keeps the previous schedule. This action cannot be undone.`}
            action={
              <Button
                variant="contained"
                color="error"
                startIcon={<Iconify icon="mdi:delete-outline" />}
                disabled={removing.isLoading}
                onClick={async () => {
                  if (!deleteTarget?.id) return;
                  try {
                    await remove({
                      id: deleteTarget.id,
                      concurrencyStamp: deleteTarget.concurrencyStamp,
                    }).unwrap();
                    confirm.onFalse();
                    setDeleteTarget(null);
                    shikshaMitraToast.success({ message: 'Individual schedule deleted.' });
                  } catch (error) {
                    shikshaMitraToast.error({
                      message: attendanceError(error, 'Schedule could not be deleted.'),
                    });
                  }
                }}
              >
                Delete
              </Button>
            }
          />
        </Stack>
      </FormBusyRegion>
    </Paper>
  );
}
