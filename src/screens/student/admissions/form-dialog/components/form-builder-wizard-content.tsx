import type { FormikProps } from 'formik';
import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import dayjs from 'dayjs';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';

import { FormBuilderReview } from './form-builder-review';
import { FormBuilderDetails } from './form-builder-details';
import { FormBuilderSections } from '../form-builder-sections';
import { useFormWizardFocus } from '../hooks/use-form-wizard-focus';
import { useAdmissionUnsavedChanges } from '../../use-admission-unsaved-changes';
import { useAdmissionFormDraftOwner, useAdmissionFormDraftRecovery } from '../form-draft-recovery';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  activeStep: number;
  editing?: AdmissionForm | null;
  onEditDetails: () => void;
  onEditFields: () => void;
};

export function FormBuilderWizardContent({
  formik,
  activeStep,
  editing,
  onEditDetails,
  onEditFields,
}: Props) {
  useAdmissionUnsavedChanges(true, formik.dirty);
  const contentRef = useFormWizardFocus(activeStep);
  const draftOwner = useAdmissionFormDraftOwner();
  const recovery = useAdmissionFormDraftRecovery(formik, draftOwner, editing?.id);
  return (
    <Stack
      ref={contentRef}
      sx={{
        flex: 1,
        width: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: activeStep === 1 ? 'hidden' : undefined,
        height: activeStep === 1 ? { lg: 1 } : undefined,
      }}
    >
      {recovery.candidate && (
        <Alert
          severity="warning"
          sx={{
            mx: { xs: 1.5, sm: 2 },
            mt: 1.5,
            flexShrink: 0,
            ...(activeStep === 1 && {
              py: { lg: 0.5 },
              '& .MuiAlert-message': { py: { lg: 0.5 } },
              '& .MuiAlert-action': { py: { lg: 0 } },
            }),
          }}
          action={
            <Stack direction="row" spacing={0.5}>
              <Button color="inherit" size="small" onClick={recovery.discard}>
                Discard
              </Button>
              <Button color="inherit" size="small" variant="outlined" onClick={recovery.restore}>
                Restore
              </Button>
            </Stack>
          }
        >
          Unsaved changes from {dayjs(recovery.candidate.savedAt).format('DD MMM, hh:mm A')} are
          available on this device.
        </Alert>
      )}
      {!recovery.candidate && recovery.savedAt && formik.dirty && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: { xs: 1.5, sm: 2 }, pt: 1, flexShrink: 0 }}
        >
          Changes saved on this device at {dayjs(recovery.savedAt).format('hh:mm A')}.
        </Typography>
      )}
      {activeStep === 0 && <FormBuilderDetails formik={formik} editing={Boolean(editing)} />}
      {activeStep === 1 && (
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            minHeight: 0,
            p: { xs: 1, sm: 1.5 },
            overflow: 'hidden',
            bgcolor: 'background.neutral',
          }}
        >
          <FormBuilderSections formik={formik} />
        </Box>
      )}
      {activeStep === 2 && (
        <FormBuilderReview
          form={formik.values}
          onEditDetails={onEditDetails}
          onEditFields={onEditFields}
        />
      )}
    </Stack>
  );
}
