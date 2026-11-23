import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';
import { useLazyCheckAdmissionFormNameQuery } from 'src/redux/student/admissions/admission-forms-api';

import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { isEqual } from 'src/utils/helper';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, Typography, LinearProgress, CircularProgress } from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { useAdmissionDraftGuard } from './use-admission-draft-guard';
import { getFormWizardLayout } from './form-dialog/form-wizard-layout';
import { getAdmissionWizardSteps } from './form-dialog/form-wizard-model';
import { useAdmissionFormWizard } from './form-dialog/hooks/use-admission-form-wizard';
import { FormBuilderWizardContent } from './form-dialog/components/form-builder-wizard-content';

type Props = {
  open: boolean;
  onClose: () => void;
  editingId?: string | null;
  editing?: AdmissionForm | null;
  editingError?: boolean;
  onRetryEditing?: () => void;
  initialPurpose?: CreateUpdateAdmissionForm['purpose'];
  saving: boolean;
  onSave: (value: CreateUpdateAdmissionForm) => Promise<void>;
  onPublishNow: (value: CreateUpdateAdmissionForm) => Promise<void>;
  checkUnchangedVersion?: (id: string) => Promise<string | null>;
};

export function AdmissionFormDialog({
  open,
  editingId,
  editing,
  editingError,
  onRetryEditing,
  ...props
}: Props) {
  if (!open) return null;
  if (editingId && !editing) {
    const formType = props.initialPurpose === 0 ? 'Inquiry' : 'Registration';
    return (
      <CustomDialog
        open
        title={`Edit ${formType} Form`}
        handleClose={props.onClose}
        hasForm={false}
        guardUnsavedChanges={false}
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ p: 3, minHeight: 144, justifyContent: 'center' }}>
          {editingError ? (
            <StudentFeedback
              notificationKey="STU-0060"
              presentation="toast"
              severity="error"
              toastAction={
                <Button size="small" sx={{ minHeight: 44 }} onClick={onRetryEditing}>
                  Retry
                </Button>
              }
            >
              This form could not be loaded. Try again.
            </StudentFeedback>
          ) : (
            <Stack direction="row" spacing={1.5} alignItems="center" role="status">
              <CircularProgress size={24} aria-label={`Loading ${formType.toLowerCase()} Form`} />
              <Typography variant="body2">Loading {formType.toLowerCase()} form...</Typography>
            </Stack>
          )}
        </Stack>
      </CustomDialog>
    );
  }
  return <AdmissionFormEditor editing={editing} {...props} />;
}

function AdmissionFormEditor({
  onClose,
  editing,
  initialPurpose,
  saving,
  onSave,
  onPublishNow,
  checkUnchangedVersion,
}: Omit<Props, 'open'>) {
  const inheritanceReadiness = useRef({
    enabled: Boolean(editing?.inheritance?.enabled),
    ready: false,
  });
  const wizard = useAdmissionFormWizard({
    editing,
    initialPurpose,
    onClose,
    onSave,
    onPublishNow,
    canContinue: () => !inheritanceReadiness.current.enabled || inheritanceReadiness.current.ready,
  });
  const editorFormik = useFormik<CreateUpdateAdmissionForm>({
    initialValues: wizard.initialValues,
    validationSchema: wizard.validationSchema,
    validateOnMount: true,
    validateOnChange: true,
    onSubmit: () => undefined,
  });
  const [checkAdmissionFormName] = useLazyCheckAdmissionFormNameQuery();
  const [nameAvailability, setNameAvailability] = useState<{
    name: string;
    checking: boolean;
    message: string | null;
  }>({ name: '', checking: false, message: null });
  const nameCheckSequence = useRef(0);
  const trimmedName = editorFormik.values.name.trim();
  useEffect(() => {
    nameCheckSequence.current += 1;
    const sequence = nameCheckSequence.current;
    if (!trimmedName) {
      setNameAvailability({ name: '', checking: false, message: null });
      return undefined;
    }

    setNameAvailability({ name: trimmedName, checking: true, message: null });
    const timeout = setTimeout(async () => {
      try {
        const result = await checkAdmissionFormName({
          name: trimmedName,
          ...(editing?.id ? { excludingFormId: editing.id } : {}),
        }).unwrap();
        if (nameCheckSequence.current === sequence) {
          setNameAvailability({
            name: trimmedName,
            checking: false,
            message: result.isAvailable ? null : 'This form name is already in use.',
          });
        }
      } catch {
        if (nameCheckSequence.current === sequence) {
          setNameAvailability({ name: trimmedName, checking: false, message: null });
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (nameCheckSequence.current === sequence) nameCheckSequence.current += 1;
    };
  }, [checkAdmissionFormName, editing?.id, trimmedName]);
  const nameAvailabilityIsCurrent = nameAvailability.name === trimmedName;
  const checkingName =
    Boolean(trimmedName) && (!nameAvailabilityIsCurrent || nameAvailability.checking);
  const nameConflictMessage = nameAvailabilityIsCurrent ? nameAvailability.message : null;
  const nameIsBlocked = checkingName || Boolean(nameConflictMessage);
  const savedStamp = editing?.concurrencyStamp;
  const setEditorValues = editorFormik.setValues;
  useEffect(() => {
    if (!savedStamp) return;
    // The owner supplies a new revision only after our draft save succeeds. Updating
    // this token must not reset the user's values, touched fields or current step.
    setEditorValues(
      (current) =>
        current.concurrencyStamp === savedStamp
          ? current
          : { ...current, concurrencyStamp: savedStamp },
      false
    );
  }, [savedStamp, setEditorValues]);
  const [unchangedVersion, setUnchangedVersion] = useState<string | null>(null);
  const savedVersionToCheck =
    wizard.activeStep >= 2 && !editorFormik.dirty && editing && editing.version > 1
      ? editing.id
      : undefined;
  useEffect(() => {
    setUnchangedVersion(null);
    if (!savedVersionToCheck || !checkUnchangedVersion) return undefined;
    let current = true;
    checkUnchangedVersion(savedVersionToCheck)
      .then((message) => {
        if (current) setUnchangedVersion(message);
      })
      .catch(() => {
        // The publish action still runs the authoritative check if preflight is unavailable.
      });
    return () => {
      current = false;
    };
  }, [savedVersionToCheck, savedStamp, checkUnchangedVersion]);
  const { publishBlock } = wizard;
  const matchesRejectedDraft =
    publishBlock &&
    isEqual(
      { ...publishBlock.values, concurrencyStamp: undefined },
      { ...editorFormik.values, concurrencyStamp: undefined }
    );
  const publishMessage = matchesRejectedDraft
    ? publishBlock.message
    : savedVersionToCheck
      ? unchangedVersion
      : null;
  const busy = saving || wizard.submitting;
  const closeGuard = useAdmissionDraftGuard({
    dirty: editorFormik.dirty,
    busy,
    reset: editorFormik.resetForm,
  });
  const formType = editorFormik.values.purpose === 0 ? 'Inquiry' : 'Registration';
  const steps = getAdmissionWizardSteps(editorFormik.values.purpose);
  return (
    <>
      <CustomDialog
        open
        handleClose={() => closeGuard.requestNavigation(onClose)}
        guardUnsavedChanges={false}
        disableClose={busy}
        hasForm={false}
        title={
          <Box component="span" sx={{ display: 'block' }}>
            <Stack component="span" direction="row" spacing={1.25} alignItems="center">
              <AdmissionDialogTitle
                title={`${editing ? 'Edit' : 'Create'} ${formType} Form`}
                helpText="Build the Reusable Fields, Validation, and Review Structure Used by Admission Applicants and Staff."
                helpLabel={`${formType} Form Information`}
              />
              <Label color="default" variant="soft">
                Draft
              </Label>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={((wizard.activeStep + 1) / steps.length) * 100}
              aria-label={`Step ${wizard.activeStep + 1} of ${steps.length}`}
              sx={{
                mt: 1,
                height: 4,
                borderRadius: 1,
                display: { xs: 'block', md: 'none' },
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { bgcolor: 'success.main' },
              }}
            />
          </Box>
        }
        maxWidth={false}
        fullScreen
        paperProps={{
          sx: {
            width: 1,
            height: '100dvh',
            maxWidth: 'none',
            maxHeight: 'none',
            m: 0,
            borderRadius: 0,
            backgroundImage: 'none',
            '& > .MuiBox-root > .MuiBox-root:first-of-type': { py: 1 },
          },
        }}
      >
        <DialogScrollContent
          sx={{ p: 0, height: 1, minHeight: 0, overflow: 'hidden' }}
          scrollBarProps={{
            fillContent: true,
            sx: {
              flex: '1 1 auto',
              minHeight: 0,
              '& > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper > .simplebar-content':
                { height: 1, minHeight: 0, overflow: 'hidden' },
              '& > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper':
                { overflowX: 'hidden !important' },
              '& > .simplebar-track.simplebar-horizontal': { display: 'none' },
            },
          }}
        >
          <Box sx={getFormWizardLayout(wizard.activeStep)}>
            <CustomStepperWithFormik
              initialValues={wizard.initialValues}
              formikInstance={editorFormik}
              steps={steps}
              activeStep={wizard.activeStep}
              footerPlacement={wizard.activeStep === 1 ? 'content' : 'outside'}
              validationSchema={wizard.validationSchema}
              validateOnChange
              scrollbarHeight="auto"
              showSaveButton
              saveButtonLabel="Save draft"
              nextButtonLabel="Continue"
              finalButtonLabel="Publish now"
              validateFinalStep
              disableSubmit={busy}
              backButtonProps={{ size: 'small', disabled: busy }}
              saveAndNextButtonProps={{
                loading: busy,
                disabled:
                  (wizard.activeStep === 0 && nameIsBlocked) ||
                  (wizard.activeStep === steps.length - 1 && Boolean(publishMessage)),
                'aria-describedby':
                  wizard.activeStep >= 2 && publishMessage ? 'admission-publish-block' : undefined,
                startIcon:
                  wizard.activeStep === steps.length - 1 ? (
                    <Iconify icon="mdi:publish" width={18} />
                  ) : undefined,
                endIcon:
                  wizard.activeStep < steps.length - 1 ? (
                    <Iconify icon="mdi:arrow-right" width={18} />
                  ) : undefined,
                size: 'small',
                onClickCapture: (event) => {
                  if (event.detail > 1) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                },
              }}
              saveButtonProps={{
                loading: busy,
                disabled: nameIsBlocked,
                title: 'Save This Draft and Close the Form Builder',
                startIcon: <Iconify icon="mdi:content-save-outline" width={18} />,
                size: 'small',
              }}
              handleBack={() => {
                if (!busy) wizard.back();
              }}
              handleNext={wizard.next}
              onSave={wizard.saveDraft}
              onStepClick={(index) => {
                if (!busy) wizard.goTo(index);
              }}
              isStepClickable={(index) => !busy && index <= wizard.activeStep + 1}
              validateForwardStepClick
              renderItem={({ formik, footer }) => (
                <FormBuilderWizardContent
                  formik={formik}
                  activeStep={wizard.activeStep}
                  footer={footer}
                  editing={editing}
                  onInheritanceReadinessChange={(ready) => {
                    inheritanceReadiness.current = {
                      enabled: Boolean(editorFormik.values.inheritance?.enabled),
                      ready,
                    };
                  }}
                  nameConflictMessage={nameConflictMessage}
                  checkingName={checkingName}
                  publishMessage={publishMessage}
                />
              )}
            />
          </Box>
        </DialogScrollContent>
      </CustomDialog>
      {closeGuard.confirmation}
    </>
  );
}
