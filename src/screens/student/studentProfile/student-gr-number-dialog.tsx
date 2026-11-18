import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { RouterLink } from 'src/routes/components';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { useId, useRef, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { recordsQueryUrl } from 'src/screens/student/records/records-url-state';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import {
  useGetStudentRecordSnapshotQuery,
  useCreateStudentRecordChangeMutation,
} from 'src/redux/student/records/student-record-changes-api';
import {
  Alert,
  Radio,
  Stack,
  Button,
  Skeleton,
  FormLabel,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

type GrAssignmentDraft = {
  mode: '' | 'auto' | 'manual';
  grNumber: string;
  registerReference: string;
  reason: string;
};

const grAssignmentLimits = { grNumber: 100, registerReference: 500, reason: 2000 };
const grAssignmentSchema = Yup.object({
  mode: Yup.string().required('Choose an assignment method.'),
  grNumber: Yup.string()
    .trim()
    .max(grAssignmentLimits.grNumber)
    .when('mode', { is: 'manual', then: (field) => field.required('Enter the GR number.') }),
  registerReference: Yup.string()
    .trim()
    .max(grAssignmentLimits.registerReference)
    .when('mode', {
      is: 'manual',
      then: (field) => field.required('Enter the school register reference.'),
    }),
  reason: Yup.string()
    .trim()
    .required('Enter a reason.')
    .min(5, 'Enter at least 5 characters.')
    .max(grAssignmentLimits.reason),
});

const grAlreadyAssigned = 'Students:Records:GrAlreadyAssigned';
const grIneligible = 'Students:Records:GrAssignmentIneligible';
const grPending = 'Students:Records:GrAssignmentPending';
const grDuplicate = 'Students.Onboarding.IdentifierAlreadyAllocated';

type SubmissionFeedback = {
  message: string;
  action?: 'review' | 'retry' | 'refresh';
  blocked?: boolean;
};

function grEligibilityFailure(error: unknown, code?: string): SubmissionFeedback | undefined {
  if (code === grPending)
    return {
      message: 'A GR number request is already awaiting approval.',
      action: 'review',
      blocked: true,
    };
  if (code === grAlreadyAssigned)
    return {
      message: 'This student already has a GR number. Reopen the profile to see the assignment.',
      blocked: true,
    };
  const status = error && typeof error === 'object' && 'status' in error ? error.status : undefined;
  if (code === grIneligible || status === 401 || status === 403)
    return {
      message: 'You cannot request a GR number for this student in their current record state.',
      blocked: true,
    };
  return undefined;
}

function changesUrl(studentId: string, request?: string) {
  return recordsQueryUrl(studentPaths.records.changes, '', { student: studentId, request });
}

export function StudentGrNumberAction({ student }: { student: StudentRecordProfile }) {
  const dialog = useBoolean();
  const [requestId, setRequestId] = useState<string>();
  const reviewLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (requestId) reviewLink.current?.focus();
  }, [requestId]);

  return (
    <>
      {requestId ? (
        <Button
          ref={reviewLink}
          component={RouterLink}
          href={changesUrl(student.studentId, requestId)}
          color="inherit"
          size="small"
          sx={{ display: 'flex', width: 'fit-content', textAlign: 'left' }}
        >
          View GR number request
        </Button>
      ) : (
        <Button
          onClick={dialog.onTrue}
          color="inherit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          sx={{ display: 'flex', width: 'fit-content', textAlign: 'left' }}
        >
          Assign GR number
        </Button>
      )}
      {dialog.value && (
        <StudentGrNumberDialog
          student={student}
          onClose={dialog.onFalse}
          onSubmitted={(id) => {
            setRequestId(id);
            dialog.onFalse();
          }}
        />
      )}
    </>
  );
}

function StudentGrNumberDialog({
  student,
  onClose,
  onSubmitted,
}: {
  student: StudentRecordProfile;
  onClose: () => void;
  onSubmitted: (id: string) => void;
}) {
  const id = useId();
  const router = useRouter();
  const { studentId } = student;
  const snapshot = useGetStudentRecordSnapshotQuery(
    { studentId, section: 'gr-number' },
    { refetchOnMountOrArgChange: true }
  );
  const [create, request] = useCreateStudentRecordChangeMutation();
  const [failure, setFailure] = useState<SubmissionFeedback>();
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const submitted = useRef(false);
  const lastValidation = useRef(0);
  const dialogBody = useRef<HTMLDivElement>(null);
  const current = snapshot.currentData;
  const studentName = [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(' ');
  const enrollmentYear = current?.data.academicYearId;
  const placement =
    student.enrollmentHistory?.find(
      (item) => item.isActive && item.academicYearId === enrollmentYear
    ) ?? (!enrollmentYear || enrollmentYear === student.academicYearId ? student : undefined);
  const classDivision = [placement?.standardName, placement?.divisionName]
    .filter(Boolean)
    .join(' · ');
  const alreadyAssigned = Boolean(current?.data.grNumber);
  const autoNumber =
    typeof current?.data.autoGrNumber === 'string' ? current.data.autoGrNumber : '';
  const autoUnavailable =
    current?.data.autoUnavailableReason ||
    'Automatic assignment requires an available published GR series.';
  const canSubmit =
    current && !snapshot.isFetching && !snapshot.isError && !alreadyAssigned && !failure?.blocked;
  const form = useFormik<GrAssignmentDraft>({
    initialValues: { mode: '', grNumber: '', registerReference: '', reason: '' },
    validationSchema: grAssignmentSchema,
    onSubmit: async ({ mode, grNumber, registerReference, reason }, helpers) => {
      if (!canSubmit || !mode || (mode === 'auto' && !autoNumber) || submitted.current) return;
      const payload =
        mode === 'manual'
          ? { mode, grNumber: grNumber.trim(), registerReference: registerReference.trim() }
          : { mode, grNumber: autoNumber };
      const input = {
        studentId,
        section: 'gr-number' as const,
        reason: reason.trim(),
        expectedSnapshot: current.snapshot,
        payload,
      };
      const fingerprint = JSON.stringify(input);
      const previous = attempt.current;
      const clientKey = previous?.fingerprint === fingerprint ? previous.key : crypto.randomUUID();
      attempt.current = { fingerprint, key: clientKey };
      submitted.current = true;
      setFailure(undefined);
      try {
        const result = await create({ ...input, clientKey }).unwrap();
        shikshaMitraToast.success({ message: 'GR number request submitted for approval.' });
        onSubmitted(result.id);
      } catch (error) {
        const { errorCode } = parseApiProblemDetail(error);
        const ineligible = grEligibilityFailure(error, errorCode);
        if (mode === 'manual' && errorCode === grDuplicate) {
          helpers.setFieldError(
            'grNumber',
            'This GR number is already assigned. Verify the school register.'
          );
        } else if (mode === 'manual' && errorCode === 'Students:Records:GrInvalidNumber') {
          helpers.setFieldError('grNumber', 'Enter a valid GR number from the school register.');
        } else if (errorCode === 'Students:Records:GrRegisterReferenceRequired') {
          helpers.setFieldError('registerReference', 'Enter the school register reference.');
        } else if (
          errorCode === 'Students:Records:GrAutoPreviewChanged' ||
          errorCode === 'Students:Records:GrInvalidNumber' ||
          errorCode === grDuplicate
        ) {
          setFailure({
            message:
              'The proposed GR number is no longer available. Refresh the preview and review the new number.',
            blocked: true,
            action: 'refresh',
          });
        } else if (
          errorCode === 'Students:Records:StaleSnapshot' ||
          errorCode === 'Students:Records:ConcurrencyConflict'
        ) {
          setFailure({
            message: 'This student record changed. Refresh the preview and review your draft.',
            blocked: true,
            action: 'refresh',
          });
        } else if (ineligible) {
          setFailure(ineligible);
        } else {
          setFailure({
            message:
              'The GR number request could not be submitted. Your draft is available to retry.',
          });
        }
      } finally {
        submitted.current = false;
      }
    },
  });

  const busy = form.isSubmitting || request.isLoading;
  const guard = useUnsavedNavigation(form.dirty, {
    push: router.push,
    blockNavigation: busy,
    renderConfirmation: (keep, discard) =>
      renderUnsavedConfirmation(keep, discard, {
        description: 'Your unsaved GR number request will be discarded.',
        busy,
      }),
  });
  const close = () => guard.requestNavigation(onClose);

  useEffect(() => {
    if (form.submitCount > lastValidation.current && !form.isValidating) {
      lastValidation.current = form.submitCount;
      dialogBody.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')
        ?.focus();
    }
  }, [form.isValidating, form.submitCount]);

  const fieldError = (name: keyof GrAssignmentDraft) =>
    form.touched[name] || form.submitCount > 0 ? form.errors[name] : undefined;
  const modeError = fieldError('mode');
  const modeDescription = [modeError && `${id}-method-error`, !autoNumber && `${id}-auto-help`]
    .filter(Boolean)
    .join(' ');
  const feedback: SubmissionFeedback | undefined = snapshot.isError
    ? (grEligibilityFailure(snapshot.error, parseApiProblemDetail(snapshot.error).errorCode) ?? {
        message: 'GR number options could not be loaded.',
        action: 'retry',
      })
    : failure;
  const reload = async () => {
    const result = await snapshot.refetch();
    if (result.isSuccess) setFailure(undefined);
  };

  const renderField = (
    name: Exclude<keyof GrAssignmentDraft, 'mode'>,
    label: string,
    helperText?: string
  ) => {
    const error = fieldError(name);
    return (
      <ShakingTextField error={Boolean(error)}>
        <TextField
          {...form.getFieldProps(name)}
          id={`${id}-${name}`}
          label={label}
          required
          fullWidth
          size="small"
          multiline={name === 'reason'}
          minRows={name === 'reason' ? 2 : undefined}
          slotProps={{
            htmlInput: { maxLength: grAssignmentLimits[name] },
            inputLabel: { shrink: true },
          }}
          disabled={busy || !canSubmit}
          error={Boolean(error)}
          helperText={error ?? helperText}
        />
      </ShakingTextField>
    );
  };

  return (
    <>
      <CustomDialog
        open
        title="Assign GR Number"
        titleInfo="Request an initial GR number for this student."
        handleClose={close}
        disableClose={busy}
        guardUnsavedChanges={false}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            form.handleSubmit();
          },
        }}
      >
        <DialogScrollContent>
          <Stack ref={dialogBody} spacing={2}>
            {snapshot.isFetching && !current && (
              <Stack spacing={1.5} role="status" aria-label="Loading GR number options">
                <Skeleton variant="rounded" height={44} />
                <Skeleton variant="rounded" height={44} />
              </Stack>
            )}
            {alreadyAssigned && !snapshot.isError && (
              <Alert severity="info">This student already has a GR number.</Alert>
            )}
            {feedback && (
              <Alert
                severity={feedback.action === 'review' ? 'info' : 'error'}
                action={
                  feedback.action === 'review' ? (
                    <Button
                      component={RouterLink}
                      color="inherit"
                      size="small"
                      href={changesUrl(studentId)}
                    >
                      View changes and approvals
                    </Button>
                  ) : (
                    feedback.action && (
                      <Button
                        color="inherit"
                        size="small"
                        onClick={reload}
                        disabled={snapshot.isFetching}
                      >
                        {feedback.action === 'refresh' ? 'Refresh preview' : 'Retry'}
                      </Button>
                    )
                  )
                }
              >
                {feedback.message}
              </Alert>
            )}
            {current && !alreadyAssigned && !snapshot.isError && (
              <FormSectionCard
                title="Assignment Details"
                icon={GlobalIcons.admissionDetails}
                descriptionTooltip="Use the next number from the published series or enter the number verified in the school register."
              >
                <Stack spacing={0.25} sx={{ overflowWrap: 'anywhere' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {studentName}
                  </Typography>
                  {classDivision && (
                    <Typography variant="caption" color="text.secondary">
                      {classDivision}
                    </Typography>
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  An independent reviewer must approve this request before the GR number is
                  assigned.
                </Typography>
                <ShakingTextField error={Boolean(modeError)}>
                  <FormControl
                    component="fieldset"
                    required
                    error={Boolean(modeError)}
                    disabled={busy || !canSubmit}
                  >
                    <FormLabel component="legend" id={`${id}-method`}>
                      Assignment method
                    </FormLabel>
                    <RadioGroup
                      aria-labelledby={`${id}-method`}
                      aria-describedby={modeDescription || undefined}
                      name="mode"
                      value={form.values.mode}
                      onChange={form.handleChange}
                    >
                      <FormControlLabel
                        control={
                          <Radio slotProps={{ input: { 'aria-invalid': Boolean(modeError) } }} />
                        }
                        label="Auto from published series"
                        value="auto"
                        disabled={!autoNumber || busy || !canSubmit}
                      />
                      <FormControlLabel
                        control={
                          <Radio slotProps={{ input: { 'aria-invalid': Boolean(modeError) } }} />
                        }
                        label="Manual from school register"
                        value="manual"
                      />
                    </RadioGroup>
                    {modeError && (
                      <FormHelperText id={`${id}-method-error`}>{modeError}</FormHelperText>
                    )}
                    {!autoNumber && (
                      <FormHelperText id={`${id}-auto-help`}>{autoUnavailable}</FormHelperText>
                    )}
                  </FormControl>
                </ShakingTextField>
                {form.values.mode === 'auto' && autoNumber && (
                  <TextField
                    label="Proposed GR number"
                    value={autoNumber}
                    fullWidth
                    size="small"
                    slotProps={{ input: { readOnly: true } }}
                  />
                )}
                {form.values.mode === 'manual' && (
                  <>
                    {renderField('grNumber', 'GR number')}
                    {renderField(
                      'registerReference',
                      'Register reference',
                      'Enter the register volume, page or entry used to verify this number.'
                    )}
                  </>
                )}
                {renderField('reason', 'Reason for assignment')}
              </FormSectionCard>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            size="small"
            color="inherit"
            onClick={close}
            disabled={busy}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            color="inherit"
            loading={busy}
            disabled={!canSubmit || (form.values.mode === 'auto' && !autoNumber)}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Submit for approval
          </Button>
        </DialogActions>
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
