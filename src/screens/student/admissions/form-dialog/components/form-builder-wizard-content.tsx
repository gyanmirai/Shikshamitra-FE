import type { FormikProps } from 'formik';
import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
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
  busy: boolean;
  onClose: () => void;
  onEditDetails: () => void;
  onEditFields: () => void;
};

const HEADINGS = ['Start with the form details', 'Build your admission form', 'Review your form'];
const DESCRIPTIONS = [
  'Give your form a name and choose how applicants will complete it.',
  'Add fields, arrange sections, and customize each field. Your changes stay with you as you move between steps.',
  'Check the details and structure, then save your form as a draft.',
];

export function FormBuilderWizardContent({
  formik,
  activeStep,
  editing,
  busy,
  onClose,
  onEditDetails,
  onEditFields,
}: Props) {
  useAdmissionUnsavedChanges(true, formik.dirty);
  const contentRef = useFormWizardFocus(activeStep);
  const draftOwner = useAdmissionFormDraftOwner();
  const recovery = useAdmissionFormDraftRecovery(formik, draftOwner, editing?.id);
  const cancel = () => {
    if (!formik.dirty || window.confirm('You have unsaved changes. Do you want to discard them?'))
      onClose();
  };
  return (
    <Stack sx={{ flex: 1, minHeight: 0, height: activeStep === 1 ? { lg: 1 } : undefined }}>
      <Stack
        ref={contentRef}
        direction="row"
        spacing={2}
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderTop: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography component="h2" variant="subtitle1" tabIndex={-1}>
            {HEADINGS[activeStep]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {DESCRIPTIONS[activeStep]}
          </Typography>
        </Box>
        <Button
          type="button"
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          disabled={busy}
          onClick={cancel}
          sx={{ flexShrink: 0 }}
        >
          Cancel
        </Button>
      </Stack>
      {recovery.candidate && (
        <Alert
          severity="warning"
          sx={{ mx: { xs: 1.5, sm: 2 }, mt: 1.5, flexShrink: 0 }}
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
            p: { xs: 1, sm: 2 },
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
