'use client';

import * as Yup from 'yup';
import { useEffect } from 'react';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Paper, Button, TextField, Typography, DialogActions } from '@mui/material';

import { describePipelineAssignmentOutcome } from './bulk-pipeline-counsellor-model';

import type { useBulkPipelineCounsellor } from './use-bulk-pipeline-counsellor';

type Props = { assignment: ReturnType<typeof useBulkPipelineCounsellor>; disabled: boolean };

export function BulkPipelineCounsellor({ assignment, disabled }: Props) {
  const router = useRouter();
  const formik = useFormik({
    initialValues: { counsellorId: '', reason: '' },
    validationSchema: Yup.object({
      counsellorId: Yup.string().required('Choose a counsellor.'),
      reason: Yup.string().trim().max(512, 'Use 512 characters or fewer.'),
    }),
    onSubmit: (values) => assignment.confirmAssignment(values),
  });
  const { resetForm } = formik;
  useEffect(() => {
    if (!assignment.dialogOpen) resetForm();
  }, [assignment.dialogOpen, resetForm]);
  const closeGuard = useUnsavedNavigation(assignment.dialogOpen && formik.dirty, {
    push: router.push,
    blockNavigation: assignment.busy,
    title: 'Discard counsellor change?',
    description: 'The selected counsellor and reason have not been submitted.',
  });
  const close = () => closeGuard.requestNavigation(assignment.closeDialog);
  const count = assignment.progress?.total ?? assignment.selectedRows.length;
  const blocked = disabled || assignment.busy;
  const validCounsellor = assignment.counsellors.some(
    (item) => item.id === formik.values.counsellorId
  );
  const hasContent = count || assignment.busy || assignment.failures.length || assignment.outcome;

  return (
    <>
      {hasContent ? (
        <Paper variant="outlined" sx={{ p: 1, flexShrink: 0 }}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ flex: 1, minWidth: 140 }} role="status">
                {assignment.assigning && assignment.progress
                  ? `Assigning ${assignment.progress.completed} of ${assignment.progress.total} admissions…`
                  : assignment.loadingOptions
                    ? 'Loading eligible counsellors…'
                    : !count && assignment.outcome
                      ? 'Counsellor assignment complete'
                      : `${count} ${count === 1 ? 'admission' : 'admissions'} selected on this page`}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="mdi:close" />}
                disabled={assignment.busy}
                onClick={assignment.clearSelection}
              >
                Clear
              </Button>
              {count > 0 && (
                <LoadingButton
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon="mdi:account-edit-outline" />}
                  disabled={blocked}
                  loading={assignment.loadingOptions}
                  onClick={assignment.requestAssignment}
                >
                  Assign / change counsellor
                </LoadingButton>
              )}
            </Stack>
            {assignment.outcome && (
              <StudentFeedback
                notificationKey="STU-0449"
                presentation="inline"
                severity={assignment.outcome.failed ? 'warning' : 'success'}
              >
                {describePipelineAssignmentOutcome(assignment.outcome)}
              </StudentFeedback>
            )}
            {assignment.failures.length > 0 && (
              <Scrollbar sx={{ maxHeight: 160 }}>
                <Stack spacing={0.5}>
                  {assignment.failures.map((failure) => (
                    <Typography key={failure.id} variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {failure.name}: {failure.message}
                    </Typography>
                  ))}
                </Stack>
              </Scrollbar>
            )}
          </Stack>
        </Paper>
      ) : null}
      <CustomDialog
        open={assignment.dialogOpen}
        title="Assign / change counsellor"
        titleInfo="Choose one counsellor who has access to every selected admission offering."
        maxWidth="sm"
        hasForm={false}
        guardUnsavedChanges={false}
        hasUnsavedChanges={formik.dirty}
        disableClose={assignment.busy}
        handleClose={close}
      >
        <Box component="form" onSubmit={formik.handleSubmit}>
          <DialogScrollContent>
            <Stack spacing={2}>
              <Typography variant="body2">
                {count} selected {count === 1 ? 'admission' : 'admissions'} will use this
                counsellor. If an inquiry is linked, it and its scheduled follow-ups will also move
                to this counsellor. Admission steps and status stay the same.
              </Typography>
              {assignment.optionsError ? (
                <StudentFeedback
                  notificationKey="STU-0450"
                  presentation="toast"
                  severity="error"
                  action={
                    <Button size="small" disabled={blocked} onClick={assignment.reloadOptions}>
                      Retry
                    </Button>
                  }
                >
                  {assignment.optionsError}
                </StudentFeedback>
              ) : !assignment.loadingOptions && assignment.counsellors.length === 0 ? (
                <StudentFeedback notificationKey="STU-0451" presentation="inline" severity="info">
                  No counsellor has access to all selected admissions. Select admissions from the
                  same offering, or change fewer admissions together.
                </StudentFeedback>
              ) : null}
              <CustomSelect
                fullWidth
                size="small"
                label="Counsellor"
                value={formik.values.counsellorId}
                options={assignment.counsellors.map((item) => ({
                  value: item.id,
                  label: item.name || item.userName,
                }))}
                isSearch
                isLoading={assignment.loadingOptions}
                disabled={blocked || Boolean(assignment.optionsError)}
                onChange={(value) => formik.setFieldValue('counsellorId', String(value))}
                onBlur={() => formik.setFieldTouched('counsellorId', true)}
                error={Boolean(formik.touched.counsellorId && formik.errors.counsellorId)}
                helperText={
                  (formik.touched.counsellorId && formik.errors.counsellorId) ||
                  'Only counsellors eligible for every selected offering are listed.'
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Reason for change (optional)"
                name="reason"
                value={formik.values.reason}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={blocked}
                inputProps={{ maxLength: 512 }}
                error={Boolean(formik.touched.reason && formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
              />
              {assignment.assigning && assignment.progress && (
                <Typography variant="body2" role="status" aria-live="polite">
                  Assigning {assignment.progress.completed} of {assignment.progress.total}{' '}
                  admissions…
                </Typography>
              )}
            </Stack>
          </DialogScrollContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              size="small"
              variant="outlined"
              disabled={assignment.busy}
              startIcon={<Iconify icon="mdi:close" />}
              onClick={close}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:account-check-outline" />}
              loading={assignment.assigning}
              disabled={blocked || !count || Boolean(assignment.optionsError) || !validCounsellor}
            >
              Submit
            </LoadingButton>
          </DialogActions>
        </Box>
      </CustomDialog>
      {closeGuard.confirmation}
    </>
  );
}
