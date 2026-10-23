'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Stack, Button, Typography, DialogActions, LinearProgress } from '@mui/material';
import { useGetStudentOnboardingPlacementOptionsQuery } from 'src/redux/student/onboarding/student-onboarding-api';

import StudentAssignmentDrawer from './student-assignment-drawer';

import type { StudentOnboardingItem } from './student-onboarding-model';
import type {
  StudentSetupAssignmentType,
  StudentSetupAssignmentResult,
} from './student-setup-assignment-model';

const titles: Record<StudentSetupAssignmentType, string> = {
  division: 'Division',
  'gr-number': 'GR Numbers',
  'roll-number': 'Roll Numbers',
};
export default function StudentSetupAutoAssignmentDialog({
  type,
  students,
  busy,
  results,
  onAssign,
  onClose,
}: {
  type: StudentSetupAssignmentType;
  students: StudentOnboardingItem[];
  busy: boolean;
  results: StudentSetupAssignmentResult[];
  onAssign: (divisionId?: string) => Promise<unknown>;
  onClose: () => void;
}) {
  const divisions = useGetStudentOnboardingPlacementOptionsQuery(students[0]?.id ?? '', {
    skip: type !== 'division' || !students.length,
    refetchOnMountOrArgChange: true,
  });
  const form = useFormik({
    initialValues: { divisionId: '' },
    validationSchema: Yup.object({
      divisionId:
        type === 'division' ? Yup.string().required('Choose the target division.') : Yup.string(),
    }),
    onSubmit: async ({ divisionId }) => {
      if (busy || !students.length) return;
      if (
        type === 'division' &&
        !divisions.currentData?.some((option) => option.id === divisionId && !option.isFull)
      ) {
        form.setFieldError('divisionId', 'Choose a division with available capacity.');
        return;
      }
      await onAssign(divisionId || undefined);
    },
  });
  const finished = results.length === students.length && !busy;
  const failed = results.filter((result) => result.status === 'failed').length;
  const saving = busy || form.isSubmitting;
  const { requestNavigation, confirmation } = useUnsavedNavigation(form.dirty && !finished, {
    blockNavigation: saving,
  });
  const close = () => {
    if (!saving) requestNavigation(onClose);
  };
  return (
    <>
      <StudentAssignmentDrawer
        title={`Assign ${titles[type]}`}
        onClose={close}
        busy={saving}
        actions={
          <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" onClick={close} disabled={saving}>
              {finished ? 'Close' : 'Cancel'}
            </Button>
            {!finished && (
              <Button
                size="small"
                variant="contained"
                loading={saving}
                disabled={
                  !students.length ||
                  (type === 'division' && (divisions.isFetching || divisions.isError))
                }
                onClick={() => form.submitForm()}
                startIcon={<Iconify icon="mdi:check" />}
              >
                Assign {titles[type]}
              </Button>
            )}
          </DialogActions>
        }
      >
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {students.length} {students.length === 1 ? 'student' : 'students'} on this page
            {type === 'division' && ` · ${students[0]?.standardName ?? ''}`}
          </Typography>
          {type === 'division' && (
            <>
              {divisions.isFetching && <LinearProgress aria-label="Loading target divisions" />}
              {divisions.isError && (
                <StudentFeedback
                  notificationKey="STU-1045"
                  presentation="toast"
                  severity="error"
                  action={
                    <Button size="small" onClick={() => divisions.refetch()}>
                      Retry
                    </Button>
                  }
                >
                  Could not load division capacity.
                </StudentFeedback>
              )}
              <ShakingTextField error={Boolean(form.touched.divisionId && form.errors.divisionId)}>
                <CustomSelect
                  label="Target division"
                  multiple={false}
                  size="small"
                  fullWidth
                  labelKey="label"
                  valueKey="id"
                  options={(divisions.currentData ?? []).map((option) => ({
                    ...option,
                    label: `${option.name}${option.isFull ? ' — Full' : ` — ${option.availableSeats} seats available`}`,
                  }))}
                  disabledValues={(divisions.currentData ?? [])
                    .filter((option) => option.isFull)
                    .map((option) => option.id)}
                  disabledLabel="Full"
                  value={form.values.divisionId}
                  onChange={(value) => form.setFieldValue('divisionId', value)}
                  onBlur={() => form.setFieldTouched('divisionId')}
                  disabled={saving || divisions.isFetching || divisions.isError || finished}
                  error={Boolean(form.touched.divisionId && form.errors.divisionId)}
                  helperText={form.touched.divisionId ? form.errors.divisionId : undefined}
                />
              </ShakingTextField>
            </>
          )}
          {busy && <LinearProgress aria-label="Saving student assignments" />}
          {results.length > 0 && (
            <Stack spacing={1} aria-live="polite">
              {results.map((result) => (
                <StudentFeedback
                  notificationKey="STU-1046"
                  presentation="inline"
                  key={result.student.id}
                  severity={
                    result.status === 'failed'
                      ? 'error'
                      : result.status === 'saved'
                        ? 'success'
                        : 'info'
                  }
                >
                  {result.student.studentName}: {result.message}
                </StudentFeedback>
              ))}
            </Stack>
          )}
          {finished && (
            <Typography variant="body2">
              {results.filter((result) => result.status === 'saved').length} saved;{' '}
              {results.filter((result) => result.status === 'skipped').length} already assigned or
              skipped; {failed} failed.{' '}
            </Typography>
          )}
        </Stack>
      </StudentAssignmentDrawer>
      {confirmation}
    </>
  );
}
