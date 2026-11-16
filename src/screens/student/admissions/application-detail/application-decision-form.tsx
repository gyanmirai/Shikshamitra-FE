import type { ReactNode } from 'react';
import type {
  AdmissionApplication,
  AdmissionApplicationDecisionInput,
} from 'src/redux/student/admissions/admission-applications-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useId, useRef, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Divider, TextField, FormLabel, FormControl } from '@mui/material';

import { ReviewRecoveryAlert } from '../review/review-recovery-alert';
import { ApplicationDecisionActions } from './application-decision-actions';
import { useApplicationDecisionForm } from './use-application-decision-form';

import type { AdmissionDecisionAction } from './use-admission-application-decisions';

type Props = {
  application: AdmissionApplication;
  actions: readonly AdmissionDecisionAction[];
  busy: boolean;
  children?: ReactNode;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onReload: () => Promise<AdmissionApplication>;
  onSubmit: (
    action: AdmissionDecisionAction,
    input: AdmissionApplicationDecisionInput
  ) => Promise<boolean>;
};

export function ApplicationDecisionForm({
  application,
  actions,
  busy,
  children,
  onBusyChange,
  onDirtyChange,
  onReload,
  onSubmit,
}: Props) {
  const groupId = useId();
  const submitting = useRef(false);
  const lastApplication = useRef(application);
  const reasonInput = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [choices, setChoices] = useState(actions);
  const [action, setAction] = useState<AdmissionDecisionAction | null>(null);
  const { formik, recovery, canRecord, requiresReason } = useApplicationDecisionForm({
    action,
    application,
    onReload,
    onClose: () => setAction(null),
    onSubmit: (input) => (action ? onSubmit(action, input) : Promise.resolve(false)),
  });
  const localBusy = formik.isSubmitting || recovery.reloading;
  const isBusy = busy || localBusy;
  const dirty = action !== null || formik.dirty;
  const outcomeUnavailable = Boolean(action && !actions.includes(action));
  const recoveryError =
    recovery.error ||
    (outcomeUnavailable
      ? 'The application decision changed. Your draft is still here. Reload the latest application before continuing.'
      : '');
  const reload = () =>
    recovery.reload(() => {
      formik.resetForm();
      setAction(null);
    });
  const { setSummary } = recovery;
  const showReasonError = Boolean(
    (formik.touched.reason || formik.submitCount > 0) && formik.errors.reason
  );

  // Keep an active draft's original revision until staff explicitly reload it.
  useEffect(() => {
    if (!dirty && !localBusy) {
      if (lastApplication.current !== application) {
        lastApplication.current = application;
        setSummary(application);
      }
      setChoices(actions);
    }
  }, [application, actions, dirty, localBusy, setSummary]);

  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isSubmitting && showReasonError)
      reasonInput.current?.focus();
  }, [formik.submitCount, formik.isSubmitting, showReasonError]);

  useEffect(() => {
    onBusyChange?.(localBusy);
  }, [localBusy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  return (
    <form
      aria-label="Record Decision"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        if (isBusy || submitting.current || !canRecord || !action || !actions.includes(action))
          return;
        submitting.current = true;
        try {
          await formik.submitForm();
        } finally {
          submitting.current = false;
        }
      }}
    >
      <FormBusyRegion busy={isBusy} label="Recording Admission Decision…" showOverlay={false}>
        <Stack spacing={2}>
          <FormControl component="fieldset" fullWidth disabled={isBusy}>
            <FormLabel
              id={groupId}
              component="legend"
              sx={{ typography: 'subtitle2', color: 'text.primary', mb: 1 }}
            >
              Choose an Outcome
            </FormLabel>
            <ApplicationDecisionActions
              compact
              actions={choices}
              value={action}
              labelledBy={groupId}
              busy={isBusy || outcomeUnavailable}
              onSelect={(next) => {
                setAction(next);
                formik.setTouched({}, false);
                formik.setErrors({});
              }}
            />
          </FormControl>
          {action && (
            <ShakingTextField error={showReasonError}>
              <TextField
                inputRef={reasonInput}
                fullWidth
                required={requiresReason}
                disabled={isBusy || outcomeUnavailable}
                multiline
                minRows={3}
                size="small"
                label={requiresReason ? 'Reason' : 'Reason (Optional)'}
                {...formik.getFieldProps('reason')}
                error={showReasonError}
                helperText={showReasonError ? formik.errors.reason : undefined}
              />
            </ShakingTextField>
          )}
          <ReviewRecoveryAlert
            context="application"
            error={recoveryError}
            dirty={dirty}
            busy={isBusy}
            onReload={reload}
          />
          {action && !canRecord && !recoveryError && (
            <StudentFeedback
              notificationKey="STU-0188"
              presentation="persistent"
              severity="warning"
            >
              This decision is not available in the current application state. Refresh the
              application before continuing.
            </StudentFeedback>
          )}
          <Divider />
          {children}
          <Stack direction="row" justifyContent="flex-end">
            <LoadingButton
              type="submit"
              size="small"
              variant="contained"
              color="inherit"
              disabled={isBusy || !canRecord || !action || !actions.includes(action)}
              loading={localBusy}
              startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
            >
              Record Decision
            </LoadingButton>
          </Stack>
        </Stack>
      </FormBusyRegion>
    </form>
  );
}
