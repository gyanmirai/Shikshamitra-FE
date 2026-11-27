import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useRef } from 'react';
import { Box, Stack } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';

import { FormBuilderReview } from './form-builder-review';
import { FormBuilderDetails } from './form-builder-details';
import { FormBuilderSections } from '../form-builder-sections';
import { useFormWizardFocus } from '../hooks/use-form-wizard-focus';
import { FormBuilderPrintLayout } from './form-builder-print-layout';
import { FormInheritanceProvider } from '../hooks/use-form-inheritance';

import type { BuilderIssueTarget } from '../form-builder-issue-navigation';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  activeStep: number;
  footer?: ReactNode;
  editing?: AdmissionForm | null;
  onInheritanceReadinessChange?: (ready: boolean) => void;
  nameConflictMessage?: string | null;
  checkingName?: boolean;
  publishMessage?: string | null;
  publishIssueTarget?: BuilderIssueTarget;
  onPublishIssueHandled?: () => void;
};

export function FormBuilderWizardContent({
  formik,
  activeStep,
  footer,
  editing,
  onInheritanceReadinessChange,
  nameConflictMessage,
  checkingName,
  publishMessage,
  publishIssueTarget,
  onPublishIssueHandled,
}: Props) {
  const contentRef = useFormWizardFocus(activeStep);
  const starter = useRef(formik.initialValues);
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
          height: activeStep >= 2 ? 1 : activeStep === 1 ? { lg: 1 } : undefined,
        }}
      >
        {activeStep === 0 && (
          <FormBuilderDetails
            formik={formik}
            editing={Boolean(editing)}
            starter={starter}
            nameConflictMessage={nameConflictMessage}
            checkingName={checkingName}
          />
        )}
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
            <FormBuilderSections
              formik={formik}
              footer={footer}
              publishIssueTarget={publishIssueTarget}
              onPublishIssueHandled={onPublishIssueHandled}
            />
          </Box>
        )}
        {activeStep === 2 && <FormBuilderReview formik={formik} />}
        {activeStep === 3 && formik.values.purpose !== 0 && (
          <FormBuilderPrintLayout formik={formik} />
        )}
        {activeStep >= 2 && publishMessage && (
          <StudentFeedback
            notificationKey="STU-0068"
            id="admission-publish-block"
            presentation="inline"
            severity="error"
            role="alert"
            sx={{ px: { xs: 1.5, sm: 3 }, py: 1, flexShrink: 0 }}
          >
            {publishMessage}
          </StudentFeedback>
        )}
      </Stack>
    </FormInheritanceProvider>
  );
}
