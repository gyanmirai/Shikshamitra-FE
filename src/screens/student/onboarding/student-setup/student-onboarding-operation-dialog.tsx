'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useAssignStudentOnboardingGrMutation,
  useAssignStudentOnboardingRollMutation,
  usePreviewStudentOnboardingRollMutation,
  useSetStudentOnboardingPlacementMutation,
  useGetAvailableStudentIdentifierSeriesQuery,
  useGetStudentOnboardingPlacementOptionsQuery,
} from 'src/redux/student/onboarding/student-onboarding-api';

import type { StudentOnboardingItem } from './student-onboarding-model';

export type StudentAssignmentType = 'division' | 'gr-number' | 'roll-number';
type OperationValues = {
  divisionId: string;
  numberSeriesId: string;
  manualValue: string;
  reason: string;
  rollNumber: string;
  rollAssignmentMode: string;
};
export default function StudentOnboardingOperationDialog({
  assignmentType,
  student,
  onClose,
}: {
  assignmentType: StudentAssignmentType | null;
  student: StudentOnboardingItem | null;
  onClose: () => void;
}) {
  const open = Boolean(assignmentType && student);
  const isPlacement = assignmentType === 'division';
  const isGr = assignmentType === 'gr-number';
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(permissions, 'Students.Onboarding.Add');
  const placement = useGetStudentOnboardingPlacementOptionsQuery(student?.id ?? '', {
    skip: !open || !isPlacement,
  });
  const series = useGetAvailableStudentIdentifierSeriesQuery(student?.id ?? '', {
    skip: !open || !isGr || !canManage,
  });
  const [setPlacement, placementState] = useSetStudentOnboardingPlacementMutation();
  const [assignGr, grState] = useAssignStudentOnboardingGrMutation();
  const [assignRoll, rollState] = useAssignStudentOnboardingRollMutation();
  const [previewRoll, previewState] = usePreviewStudentOnboardingRollMutation();
  const [failure, setFailure] = useState<string>();
  const [preview, setPreview] = useState<{ signature: string; proposedRollNumber: number }>();
  const mode =
    student?.rollNumberLocked && !student.rollNo
      ? 'automatic'
      : (student?.rollAssignmentMode ?? 'automatic');
  const locked = isGr
    ? student?.grNumberLocked && Boolean(student.grNo)
    : !isPlacement && student?.rollNumberLocked && Boolean(student.rollNo);
  const requiresReason = isGr
    ? Boolean(student?.grNo)
    : !isPlacement && Boolean(student?.rollNo && student.rollChangeReasonRequired);
  const busy =
    placementState.isLoading || grState.isLoading || rollState.isLoading || previewState.isLoading;
  const form = useFormik<OperationValues>({
    initialValues: {
      divisionId: student?.divisionId ?? '',
      numberSeriesId: '',
      manualValue: '',
      reason: '',
      rollNumber: '',
      rollAssignmentMode: mode === 'both' ? '' : mode,
    },
    validationSchema: Yup.object({
      divisionId: isPlacement ? Yup.string().required('Choose a division.') : Yup.string(),
      numberSeriesId: isGr ? Yup.string().required('Choose a GR series.') : Yup.string(),
      reason: requiresReason
        ? Yup.string().trim().required('Enter a reason for changing the number.').max(1000)
        : Yup.string().max(1000),
      rollAssignmentMode:
        !isPlacement && !isGr
          ? Yup.string().oneOf(['automatic', 'manual']).required('Choose a numbering method.')
          : Yup.string(),
      rollNumber: Yup.string().when('rollAssignmentMode', {
        is: 'manual',
        then: (field) =>
          isPlacement || isGr
            ? field
            : field
                .required('Enter a Roll number.')
                .test(
                  'positive',
                  'Enter a positive whole number.',
                  (value) => Number.isInteger(Number(value)) && Number(value) > 0
                ),
      }),
    }),
    onSubmit: async (values): Promise<void> => {
      if (!student || !canManage || locked || busy) return;
      setFailure(undefined);
      try {
        const common = {
          id: student.id,
          concurrencyStamp: student.concurrencyStamp,
          reason: values.reason.trim() || undefined,
        };
        if (isPlacement) {
          const option = placement.data?.find((item) => item.id === values.divisionId);
          if (!option || option.isFull) {
            setFailure('Choose a division with available capacity.');
            return;
          }
          await setPlacement({ ...common, divisionId: values.divisionId }).unwrap();
        } else if (isGr) {
          if (!series.data?.some((item) => item.id === values.numberSeriesId)) {
            setFailure('Choose an available published GR series.');
            return;
          }
          await assignGr({
            ...common,
            numberSeriesId: values.numberSeriesId,
            manualValue: values.manualValue.trim() || undefined,
          }).unwrap();
        } else {
          if (!currentPreview) {
            setFailure('Preview the current Roll number before assigning.');
            return;
          }
          await assignRoll({
            ...common,
            rollNumber: currentPreview.proposedRollNumber,
            rollAssignmentMode: values.rollAssignmentMode as 'manual' | 'automatic',
          }).unwrap();
        }
        shikshaMitraToast.success({
          message: `${isPlacement ? 'Division' : isGr ? 'GR number' : 'Roll number'} saved for ${student.studentName}.`,
        });
        onClose();
      } catch (error) {
        setPreview(undefined);
        setFailure(
          parseApiProblemDetail(error).detail ||
            'The assignment could not be saved. Refresh the case and retry.'
        );
      }
    },
  });
  const signature = JSON.stringify({ values: form.values, stamp: student?.concurrencyStamp, mode });
  const currentPreview = preview?.signature === signature ? preview : undefined;
  const { resetForm } = form;
  useEffect(() => {
    resetForm({
      values: {
        divisionId: student?.divisionId ?? '',
        numberSeriesId: '',
        manualValue: '',
        reason: '',
        rollNumber: student?.rollNo ? String(student.rollNo) : '',
        rollAssignmentMode: mode === 'both' ? '' : mode,
      },
    });
    setFailure(undefined);
    setPreview(undefined);
    // Preserve entered values during background refresh; the preview signature invalidates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student?.id, assignmentType, resetForm]);
  const canPreview =
    canManage &&
    !locked &&
    !busy &&
    Boolean(student?.divisionId) &&
    ['manual', 'automatic'].includes(form.values.rollAssignmentMode) &&
    (mode === 'both' || mode === form.values.rollAssignmentMode) &&
    (!requiresReason || Boolean(form.values.reason.trim())) &&
    (form.values.rollAssignmentMode === 'automatic' ||
      (Number.isInteger(Number(form.values.rollNumber)) && Number(form.values.rollNumber) > 0));
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={isPlacement ? 'Assign Division' : isGr ? 'Assign GR Number' : 'Assign Roll Number'}
      maxWidth="sm"
      fullWidth
      hasUnsavedChanges={form.dirty}
      disableClose={busy}
    >
      <DialogScrollContent dividers>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">
            {student?.studentName} · {student?.standardName} / {student?.divisionName}
          </Typography>
          {failure && (
            <StudentFeedback notificationKey="STU-1002" presentation="persistent" severity="error">
              {failure}
            </StudentFeedback>
          )}
          {!canManage && (
            <StudentFeedback notificationKey="STU-1003" presentation="inline" severity="info">
              Your role can view this task. Assignment requires onboarding permission.
            </StudentFeedback>
          )}
          {locked && (
            <StudentFeedback notificationKey="STU-1004" presentation="inline" severity="info">
              This number is locked. An administrator must unlock it before a correction.
            </StudentFeedback>
          )}
          {isPlacement ? (
            <>
              <CustomSelect
                label="Division"
                size="small"
                required
                fullWidth
                value={form.values.divisionId}
                options={(placement.data ?? []).map((option) => ({
                  value: option.id,
                  label: `${option.name} · ${option.availableSeats} seats available`,
                }))}
                disabledValues={(placement.data ?? [])
                  .filter((option) => option.isFull)
                  .map((option) => option.id)}
                onChange={(value) => form.setFieldValue('divisionId', String(value))}
                disabled={busy || !canManage || placement.isFetching || placement.isError}
              />
              {placement.isError ? (
                <StudentFeedback
                  notificationKey="STU-1005"
                  presentation="toast"
                  severity="error"
                >
                  Division capacity could not be loaded. Close and retry.
                </StudentFeedback>
              ) : (
                !placement.isFetching &&
                !placement.data?.length && (
                  <StudentFeedback notificationKey="STU-1006" presentation="inline" severity="info">
                    No divisions are available.
                  </StudentFeedback>
                )
              )}
            </>
          ) : isGr ? (
            <>
              <CustomSelect
                label="GR series"
                size="small"
                required
                fullWidth
                value={form.values.numberSeriesId}
                options={(series.data ?? []).map((item) => ({
                  value: item.id,
                  label: `${item.name} · Next ${item.nextPreview}`,
                }))}
                onChange={(value) => form.setFieldValue('numberSeriesId', String(value))}
                disabled={busy || !canManage || !!locked || series.isFetching || series.isError}
                error={Boolean(form.touched.numberSeriesId && form.errors.numberSeriesId)}
                helperText={form.touched.numberSeriesId ? form.errors.numberSeriesId : undefined}
              />
              {series.isError ? (
                <StudentFeedback
                  notificationKey="STU-1007"
                  presentation="toast"
                  severity="error"
                >
                  GR series could not be loaded. Close and retry.
                </StudentFeedback>
              ) : (
                !series.isFetching &&
                !series.data?.length && (
                  <StudentFeedback notificationKey="STU-1008" presentation="inline" severity="info">
                    No published GR series matches this student.
                  </StudentFeedback>
                )
              )}
              {student?.grManualEntryAllowed && !(student.grNumberLocked && !student.grNo) && (
                <TextField
                  label="Manual GR number"
                  size="small"
                  fullWidth
                  name="manualValue"
                  value={form.values.manualValue}
                  onChange={form.handleChange}
                  disabled={busy || !canManage || !!locked}
                  helperText="Leave empty to use the next number."
                />
              )}
            </>
          ) : (
            <>
              {!student?.divisionId && (
                <StudentFeedback notificationKey="STU-1009" presentation="inline" severity="info">
                  Assign a Division before preparing a Roll number.
                </StudentFeedback>
              )}
              {mode === 'both' && (
                <CustomSelect
                  label="Numbering method"
                  size="small"
                  required
                  value={form.values.rollAssignmentMode}
                  options={[
                    { value: 'automatic', label: 'Automatic' },
                    { value: 'manual', label: 'Manual' },
                  ]}
                  onChange={(value) => form.setFieldValue('rollAssignmentMode', String(value))}
                  disabled={busy || !canManage || !!locked}
                />
              )}
              {form.values.rollAssignmentMode === 'manual' && (
                <TextField
                  label="Roll number"
                  required
                  size="small"
                  type="number"
                  name="rollNumber"
                  value={form.values.rollNumber}
                  onChange={form.handleChange}
                  disabled={busy || !canManage || !!locked}
                  error={Boolean(form.touched.rollNumber && form.errors.rollNumber)}
                  helperText={form.touched.rollNumber ? form.errors.rollNumber : undefined}
                />
              )}
              <Typography variant="caption" color="text.secondary">
                Numbers start at 1 and are unique within this Class and Division.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                disabled={!canPreview}
                loading={previewState.isLoading}
                onClick={async () => {
                  if (!student || !canPreview) return;
                  try {
                    const result = await previewRoll({
                      id: student.id,
                      rollAssignmentMode: form.values.rollAssignmentMode as 'automatic' | 'manual',
                      rollNumber:
                        form.values.rollAssignmentMode === 'manual'
                          ? Number(form.values.rollNumber)
                          : undefined,
                      reason: form.values.reason.trim() || undefined,
                    }).unwrap();
                    if (
                      result.concurrencyStamp !== student.concurrencyStamp ||
                      result.schoolAssignmentMode !== mode
                    ) {
                      setFailure('The case or numbering rule changed. Refresh and preview again.');
                      return;
                    }
                    setPreview({ signature, proposedRollNumber: result.proposedRollNumber });
                    setFailure(undefined);
                  } catch (error) {
                    setFailure(
                      parseApiProblemDetail(error).detail ||
                        'Roll preview failed. Review the Division and retry.'
                    );
                  }
                }}
              >
                Preview Roll number
              </Button>
              {currentPreview && (
                <StudentFeedback notificationKey="STU-1010" presentation="inline" severity="info">
                  Proposed Roll number: {currentPreview.proposedRollNumber}
                </StudentFeedback>
              )}
            </>
          )}
          {requiresReason && (
            <TextField
              label="Change reason"
              required
              multiline
              minRows={2}
              size="small"
              name="reason"
              value={form.values.reason}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              disabled={busy || !!locked}
              error={Boolean(form.touched.reason && form.errors.reason)}
              helperText={form.touched.reason ? form.errors.reason : undefined}
              inputProps={{ maxLength: 1000 }}
            />
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" size="small" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          loading={busy}
          disabled={!canManage || !!locked || (!isPlacement && !isGr && !currentPreview)}
          onClick={() => form.submitForm()}
        >
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
