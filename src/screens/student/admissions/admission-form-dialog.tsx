import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, Typography, LinearProgress, CircularProgress } from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { ADMISSION_FORM_STEPS } from './form-dialog/form-wizard-model';
import { getFormWizardLayout } from './form-dialog/form-wizard-layout';
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
    return (
      <CustomDialog
        open
        title="Edit admission form"
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
              action={
                <Button size="small" sx={{ minHeight: 44 }} onClick={onRetryEditing}>
                  Retry
                </Button>
              }
            >
              This form could not be loaded. Try again.
            </StudentFeedback>
          ) : (
            <Stack direction="row" spacing={1.5} alignItems="center" role="status">
              <CircularProgress size={24} aria-label="Loading admission form" />
              <Typography variant="body2">Loading admission form...</Typography>
            </Stack>
          )}
        </Stack>
      </CustomDialog>
    );
  }
  return <AdmissionFormEditor key={editing?.id ?? 'new'} editing={editing} {...props} />;
}

function AdmissionFormEditor({
  onClose,
  editing,
  initialPurpose,
  saving,
  onSave,
  onPublishNow,
}: Omit<Props, 'open'>) {
  const wizard = useAdmissionFormWizard({ editing, initialPurpose, onClose, onSave, onPublishNow });
  const busy = saving || wizard.submitting;
  return (
    <CustomDialog
      open
      handleClose={onClose}
      disableClose={busy}
      hasForm={false}
      title={
        <Box component="span" sx={{ display: 'block' }}>
          <Stack component="span" direction="row" spacing={1.25} alignItems="center">
            <AdmissionDialogTitle
              title={editing ? 'Edit admission form' : 'Create admission form'}
              helpText="Build the reusable fields, validation, and review structure used by admission applicants and staff."
              helpLabel="Admission form information"
            />
            <Label color="default" variant="soft">
              Draft
            </Label>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={((wizard.activeStep + 1) / ADMISSION_FORM_STEPS.length) * 100}
            aria-label={`Step ${wizard.activeStep + 1} of ${ADMISSION_FORM_STEPS.length}`}
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
            steps={ADMISSION_FORM_STEPS}
            activeStep={wizard.activeStep}
            footerPlacement={wizard.activeStep === 1 ? 'content' : 'outside'}
            validationSchema={wizard.validationSchema}
            validateOnChange
            scrollbarHeight="auto"
            showSaveButton
            saveButtonLabel="Save draft"
            nextButtonLabel="Continue"
            finalButtonLabel="Publish now"
            backButtonProps={{ size: 'small' }}
            saveAndNextButtonProps={{
              loading: busy,
              startIcon:
                wizard.activeStep === ADMISSION_FORM_STEPS.length - 1 ? (
                  <Iconify icon="mdi:publish" width={18} />
                ) : undefined,
              endIcon:
                wizard.activeStep < ADMISSION_FORM_STEPS.length - 1 ? (
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
              title: 'Save this draft and close the form builder',
              startIcon: <Iconify icon="mdi:content-save-outline" width={18} />,
              size: 'small',
            }}
            handleBack={wizard.back}
            handleNext={wizard.next}
            onSave={wizard.saveDraft}
            onStepClick={wizard.goTo}
            isStepClickable={(index) => index <= wizard.activeStep + 1}
            validateForwardStepClick
            renderItem={({ formik, footer }) => (
              <FormBuilderWizardContent
                formik={formik}
                activeStep={wizard.activeStep}
                footer={footer}
                editing={editing}
              />
            )}
          />
        </Box>
      </DialogScrollContent>
    </CustomDialog>
  );
}
