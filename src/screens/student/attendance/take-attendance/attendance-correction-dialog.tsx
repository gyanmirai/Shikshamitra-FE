import type {
  AttendanceScope,
  AttendanceStudent,
  AttendancePolicySummary,
  AttendanceCorrectionRequest,
} from 'src/redux/student/take-attendance/attendance-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { formatDateOnly } from 'src/utils/date-only';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { AttendanceStatus } from 'src/enums/student-attendace-status';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useRequestAttendanceCorrectionMutation } from 'src/redux/student/take-attendance/take-attendace-api';
import {
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { attendanceStudentName } from './attendance-draft';

export default function AttendanceCorrectionDialog({
  student,
  policy,
  scope,
  revision,
  onClose,
}: {
  student: AttendanceStudent;
  policy: AttendancePolicySummary;
  scope: AttendanceScope;
  revision: string;
  onClose: () => void;
}) {
  const [request, { isLoading }] = useRequestAttendanceCorrectionMutation();
  const [failure, setFailure] = useState('');
  const operation = useRef<{ serialized: string; id: string } | null>(null);
  const formik = useFormik({
    initialValues: {
      status: student.status,
      late: student.late,
      halfDay: student.halfDay,
      remarks: student.remarks || '',
      reason: '',
    },
    validationSchema: Yup.object({
      status: Yup.number().oneOf([AttendanceStatus.Present, AttendanceStatus.Absent]).required(),
      remarks: Yup.string().max(500, 'Use 500 characters or fewer.'),
      reason: Yup.string()
        .trim()
        .required('Enter a correction reason.')
        .max(500, 'Use 500 characters or fewer.'),
    }),
    onSubmit: async (values) => {
      const normalized = {
        ...scope,
        studentId: student.studentId,
        ...values,
        reason: values.reason.trim(),
        revision,
        late: values.status === AttendanceStatus.Present && values.late,
        halfDay: values.status === AttendanceStatus.Present && values.halfDay,
      };
      const serialized = JSON.stringify(normalized);
      if (operation.current?.serialized !== serialized)
        operation.current = { serialized, id: crypto.randomUUID() };
      const payload: AttendanceCorrectionRequest = {
        ...normalized,
        operationId: operation.current.id,
      };
      setFailure('');
      try {
        const result = await request(payload).unwrap();
        shikshaMitraToast.success({
          message:
            result.status === 'Applied'
              ? 'Attendance correction applied.'
              : 'Attendance correction sent for approval.',
        });
        onClose();
      } catch (problem) {
        setFailure(parseApiProblemDetail(problem).detail);
      }
    },
  });
  const changed =
    formik.values.status !== student.status ||
    formik.values.late !== student.late ||
    formik.values.halfDay !== student.halfDay ||
    formik.values.remarks !== (student.remarks || '') ||
    student.needsCreditCorrection === true;
  return (
    <CustomDialog
      open
      title="Request attendance correction"
      handleClose={onClose}
      hasUnsavedChanges={formik.dirty}
      disableClose={isLoading}
      maxWidth="sm"
    >
      <DialogScrollContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="body2">
          Correct {attendanceStudentName(student)}&apos;s mark for {formatDateOnly(scope.date)}.
          Your school policy decides whether approval is required.
        </Typography>
        {student.needsCreditCorrection && (
          <StudentFeedback notificationKey="STU-0640" presentation="persistent" severity="info">
            Approved leave changed after this attendance was submitted. Request a correction to
            update leave credit, even when Present or Absent stays unchanged.
          </StudentFeedback>
        )}
        {failure && (
          <StudentFeedback notificationKey="STU-0641" presentation="persistent" severity="error">
            {failure} Your requested change is retained. Review the latest register if it has
            changed.
          </StudentFeedback>
        )}
        <CustomSelect
          fullWidth
          size="small"
          label="Correct attendance to"
          options={[
            { value: 1, label: 'Present' },
            { value: 2, label: 'Absent' },
          ]}
          value={formik.values.status}
          valueKey="value"
          labelKey="label"
          disabled={isLoading}
          onChange={(value) => {
            formik.setFieldValue('status', Number(value));
            if (Number(value) !== AttendanceStatus.Present) {
              formik.setFieldValue('late', false);
              formik.setFieldValue('halfDay', false);
            }
          }}
        />
        {policy.allowLate && (
          <FormControlLabel
            label="Late"
            control={
              <Checkbox
                name="late"
                checked={formik.values.late}
                onChange={formik.handleChange}
                disabled={isLoading || formik.values.status !== AttendanceStatus.Present}
              />
            }
          />
        )}
        {policy.allowHalfDay && (
          <FormControlLabel
            label="Half-day"
            control={
              <Checkbox
                name="halfDay"
                checked={formik.values.halfDay}
                onChange={formik.handleChange}
                disabled={isLoading || formik.values.status !== AttendanceStatus.Present}
              />
            }
          />
        )}
        <TextField
          fullWidth
          name="remarks"
          label="Note (optional)"
          size="small"
          value={formik.values.remarks}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isLoading}
          error={!!(formik.touched.remarks && formik.errors.remarks)}
          helperText={formik.touched.remarks && formik.errors.remarks}
          inputProps={{ maxLength: 500 }}
        />
        <TextField
          fullWidth
          name="reason"
          label="Correction reason"
          size="small"
          required
          multiline
          minRows={2}
          value={formik.values.reason}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isLoading}
          error={!!(formik.touched.reason && formik.errors.reason)}
          helperText={
            (formik.touched.reason && formik.errors.reason) ||
            'The reason is recorded with the correction history.'
          }
          inputProps={{ maxLength: 500 }}
        />
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={isLoading}
          onClick={onClose}
          startIcon={<Iconify icon="mdi:close" />}
        >
          Cancel
        </Button>
        <Button
          size="small"
          type="submit"
          variant="contained"
          loading={isLoading}
          disabled={isLoading || !changed}
          onClick={() => formik.submitForm()}
          startIcon={<Iconify icon="mdi:check" />}
        >
          Request correction
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
