import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { Box, Chip, Stack } from '@mui/material';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { ADMISSION_FORM_STEPS } from './form-dialog/form-wizard-model';
import { getFormWizardLayout } from './form-dialog/form-wizard-layout';
import { useAdmissionFormWizard } from './form-dialog/hooks/use-admission-form-wizard';
import { FormBuilderWizardContent } from './form-dialog/components/form-builder-wizard-content';

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: AdmissionForm | null;
  saving: boolean;
  onSave: (value: CreateUpdateAdmissionForm) => Promise<void>;
};

export function AdmissionFormDialog({ open, editing, ...props }: Props) {
  return open ? (
    <AdmissionFormEditor key={editing?.id ?? 'new'} editing={editing} {...props} />
  ) : null;
}

function AdmissionFormEditor({ onClose, editing, saving, onSave }: Omit<Props, 'open'>) {
  const wizard = useAdmissionFormWizard({ editing, onClose, onSave });
  const busy = saving || wizard.submitting;
  return (
    <CustomDialog
      open
      handleClose={onClose}
      disableClose={busy}
      hasForm={false}
      title={
        <Stack component="span" direction="row" spacing={1.5} alignItems="center">
          <AdmissionDialogTitle
            title={editing ? 'Edit admission form' : 'Create admission form'}
            helpText="Build the reusable fields, validation, and review structure used by admission applicants and staff."
            helpLabel="Admission form information"
          />
          <Chip component="span" size="small" label="Draft" variant="outlined" />
        </Stack>
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
          },
        }}
      >
        <Box sx={getFormWizardLayout(wizard.activeStep)}>
          <CustomStepperWithFormik
            initialValues={wizard.initialValues}
            steps={ADMISSION_FORM_STEPS}
            activeStep={wizard.activeStep}
            validationSchema={wizard.validationSchema}
            validateOnChange
            scrollbarHeight="auto"
            showSaveButton={wizard.activeStep < ADMISSION_FORM_STEPS.length - 1}
            nextButtonLabel="Next"
            finalButtonLabel="Save draft"
            saveAndNextButtonProps={{
              loading: busy,
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
            }}
            handleBack={wizard.back}
            handleNext={wizard.next}
            onSave={wizard.saveDraft}
            onStepClick={wizard.goTo}
            isStepClickable={(index) => index <= wizard.activeStep + 1}
            validateForwardStepClick
            renderItem={({ formik }) => (
              <FormBuilderWizardContent
                formik={formik}
                activeStep={wizard.activeStep}
                editing={editing}
                busy={busy}
                onClose={onClose}
                onEditDetails={() => wizard.goTo(0)}
                onEditFields={() => wizard.goTo(1)}
              />
            )}
          />
        </Box>
      </DialogScrollContent>
    </CustomDialog>
  );
}
