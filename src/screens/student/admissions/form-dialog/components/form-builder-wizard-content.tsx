import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { Box, Stack } from '@mui/material';

import { FormBuilderReview } from './form-builder-review';
import { FormBuilderDetails } from './form-builder-details';
import { FormBuilderSections } from '../form-builder-sections';
import { useFormWizardFocus } from '../hooks/use-form-wizard-focus';
import { FormInheritanceProvider } from '../hooks/use-form-inheritance';
import { useAdmissionUnsavedChanges } from '../../use-admission-unsaved-changes';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  activeStep: number;
  footer?: ReactNode;
  editing?: AdmissionForm | null;
  onInheritanceReadinessChange?: (ready: boolean) => void;
};

export function FormBuilderWizardContent({
  formik,
  activeStep,
  footer,
  editing,
  onInheritanceReadinessChange,
}: Props) {
  useAdmissionUnsavedChanges(true, formik.dirty);
  const contentRef = useFormWizardFocus(activeStep);
  return (
    <FormInheritanceProvider
      formik={formik}
      editingId={editing?.id}
      active={activeStep > 0}
      onReadinessChange={onInheritanceReadinessChange}
    >
      <Stack
        ref={contentRef}
        sx={{
          flex: 1,
          width: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: activeStep !== 0 ? 'hidden' : undefined,
          height: activeStep === 2 ? 1 : activeStep === 1 ? { lg: 1 } : undefined,
        }}
      >
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
            <FormBuilderSections formik={formik} footer={footer} />
          </Box>
        )}
        {activeStep === 2 && <FormBuilderReview formik={formik} />}
      </Stack>
    </FormInheritanceProvider>
  );
}
