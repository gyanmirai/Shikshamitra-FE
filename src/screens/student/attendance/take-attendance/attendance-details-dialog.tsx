import type {
  AttendanceStudent,
  AttendancePolicySummary,
} from 'src/redux/student/take-attendance/attendance-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { AttendanceStatus } from 'src/enums/student-attendace-status';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { attendanceStudentName } from './attendance-draft';

export default function AttendanceDetailsDialog({
  student,
  policy,
  onClose,
  onApply,
}: {
  student: AttendanceStudent;
  policy: AttendancePolicySummary;
  onClose: () => void;
  onApply: (row: AttendanceStudent) => void;
}) {
  const formik = useFormik({
    initialValues: { late: student.late, halfDay: student.halfDay, remarks: student.remarks || '' },
    validationSchema: Yup.object({
      remarks: Yup.string().max(500, 'Use 500 characters or fewer.'),
    }),
    onSubmit: (values) => {
      onApply({ ...student, ...values });
      onClose();
    },
  });
  const present = student.status === AttendanceStatus.Present;
  return (
    <CustomDialog
      open
      title={`Attendance details · ${attendanceStudentName(student)}`}
      handleClose={onClose}
      hasUnsavedChanges={formik.dirty}
      maxWidth="sm"
    >
      <DialogScrollContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Add optional details to this student&apos;s daily mark. Apply them to the draft, then save
          the register.
        </Typography>
        {student.scheduleLabel && (
          <Typography variant="body2">
            Expected schedule: {student.scheduleLabel}. Completing this schedule counts as a full
            day.
          </Typography>
        )}
        {student.approvedLeaveId && (
          <Typography variant="body2" color="warning.main">
            Approved leave is linked to this day. Record what you observed; any conflict will be
            checked when you save.
          </Typography>
        )}
        {(policy.allowLate || policy.allowHalfDay) && !present && (
          <Typography variant="body2" color="text.secondary">
            Mark Present to add Late or Half-day details.
          </Typography>
        )}
        {policy.allowLate && (
          <FormControlLabel
            label="Late"
            control={
              <Checkbox
                name="late"
                checked={formik.values.late}
                onChange={formik.handleChange}
                disabled={!present}
              />
            }
          />
        )}
        {policy.allowHalfDay && (
          <FormControlLabel
            label={`Half-day (${policy.halfDayCredit} day credit)`}
            control={
              <Checkbox
                name="halfDay"
                checked={formik.values.halfDay}
                onChange={formik.handleChange}
                disabled={!present}
              />
            }
          />
        )}
        <TextField
          name="remarks"
          label="Note (optional)"
          value={formik.values.remarks}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          multiline
          minRows={2}
          fullWidth
          size="small"
          inputProps={{ maxLength: 500 }}
          error={!!(formik.touched.remarks && formik.errors.remarks)}
          helperText={formik.touched.remarks && formik.errors.remarks}
        />
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          type="submit"
          startIcon={<Iconify icon="mdi:check" />}
          onClick={() => formik.submitForm()}
        >
          Apply details
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
