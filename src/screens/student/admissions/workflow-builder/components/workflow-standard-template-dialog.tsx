'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomAccordion from 'src/components/custom-accordian';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, Drawer, Divider, IconButton, Typography } from '@mui/material';

import { WorkflowInquiryContext } from './workflow-inquiry-context';
import { WorkflowTemplateSelector } from './workflow-template-selector';
import { AdmissionDefinitionSelect } from '../../admission-definition-select';
import {
  WORKFLOW_TEMPLATE_IDS,
  ADMISSION_WORKFLOW_TEMPLATES,
  getWorkflowTemplateDefinition,
} from '../../workflow-template';

import type { WorkflowTemplateId } from '../../workflow-template';
import type {
  AdmissionDefinitionOption,
  AdmissionDefinitionFetcher,
} from '../../use-admission-definition-options';

type Props = {
  open: boolean;
  onClose: () => void;
  initialTemplateId?: WorkflowTemplateId;
  initialInquiryFormDefinitionId?: string | null;
  initialInquiryForm?: AdmissionDefinitionOption | null;
  initialRegistrationFormDefinitionId?: string | null;
  initialRegistrationForm?: AdmissionDefinitionOption | null;
  fetchInquiryForms: AdmissionDefinitionFetcher;
  fetchRegistrationForms: AdmissionDefinitionFetcher;
  onApply: (
    templateId: WorkflowTemplateId,
    registrationFormDefinitionId: string,
    inquiryFormDefinitionId: string | null
  ) => void;
  onOpenFormBuilder: () => void;
};

const schema = Yup.object({
  templateId: Yup.string().oneOf(WORKFLOW_TEMPLATE_IDS).required('Select a journey template'),
  registrationFormDefinitionId: Yup.string().required('Select a published registration form'),
  inquiryFormDefinitionId: Yup.string().nullable(),
});

export function WorkflowStandardTemplateDialog({
  open,
  onClose,
  initialTemplateId = 'standard',
  initialInquiryFormDefinitionId = null,
  initialInquiryForm,
  initialRegistrationFormDefinitionId = null,
  initialRegistrationForm,
  fetchInquiryForms,
  fetchRegistrationForms,
  onApply,
  onOpenFormBuilder,
}: Props) {
  const previewOpen = useBoolean(false);
  const isMobile = useResponsive('down', 'sm');
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [discardAction, setDiscardAction] = useState<'close' | 'forms' | null>(null);
  useEffect(() => {
    if (open) setWarningDismissed(false);
  }, [open]);
  const initialValues = {
    templateId: ADMISSION_WORKFLOW_TEMPLATES.some((template) => template.id === initialTemplateId)
      ? initialTemplateId
      : ('standard' as const),
    registrationFormDefinitionId: initialRegistrationFormDefinitionId ?? '',
    inquiryFormDefinitionId: initialInquiryFormDefinitionId,
  };
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: schema,
    onSubmit: (values) => {
      onApply(
        values.templateId,
        values.registrationFormDefinitionId,
        values.inquiryFormDefinitionId || null
      );
      formik.resetForm();
      onClose();
    },
  });
  const closeDrawer = () => {
    formik.resetForm();
    onClose();
  };
  const requestExit = (action: 'close' | 'forms') => {
    if (formik.dirty) {
      setDiscardAction(action);
      return;
    }
    closeDrawer();
    if (action === 'forms') onOpenFormBuilder();
  };
  const discardAndExit = () => {
    const action = discardAction;
    setDiscardAction(null);
    closeDrawer();
    if (action === 'forms') onOpenFormBuilder();
  };
  const selectedTemplate =
    getWorkflowTemplateDefinition(formik.values.templateId) ?? ADMISSION_WORKFLOW_TEMPLATES[0];

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => requestExit('close')}
        PaperProps={{
          sx: {
            width: { xs: 1, sm: 720 },
            maxWidth: 1,
            height: '100dvh',
            display: 'flex',
            overflow: 'hidden',
          },
          role: 'dialog',
          'aria-labelledby': 'workflow-template-drawer-title',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Typography id="workflow-template-drawer-title" variant="h6">
              Choose a Workflow Template
            </Typography>
            <CustomTooltip
              title="Replace this draft’s journey and select the published forms it uses."
              arrow
              placement={isMobile ? 'bottom' : 'right'}
            >
              <IconButton
                size="small"
                color="info"
                aria-label="Workflow template information"
                sx={{ width: 44, height: 44, flexShrink: 0 }}
              >
                <Iconify icon="mdi:information-outline" width={18} />
              </IconButton>
            </CustomTooltip>
          </Stack>
          <IconButton
            size="small"
            aria-label="Close workflow template"
            onClick={() => requestExit('close')}
            sx={{ width: 44, height: 44, flexShrink: 0 }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: { xs: 1.5, sm: 2 },
            bgcolor: 'background.neutral',
          }}
        >
          <Stack spacing={2}>
            {!warningDismissed && (
              <StudentFeedback
                notificationKey="STU-0587"
                presentation="inline"
                severity="warning"
                icon={<Iconify icon="mdi:alert-outline" />}
                closeText="Dismiss template replacement warning"
                onClose={() => setWarningDismissed(true)}
                sx={{ '& .MuiAlert-action .MuiIconButton-root': { width: 44, height: 44 } }}
              >
                This replaces the current stages and routes when you apply it. Save the draft to
                keep the change.
              </StudentFeedback>
            )}
            <FormSectionCard icon="mdi:sitemap-outline" title="Starting journey">
              <Stack spacing={2}>
                <WorkflowTemplateSelector
                  value={formik.values.templateId}
                  onChange={(value) => formik.setFieldValue('templateId', value)}
                  columns={1}
                />
                <CustomAccordion
                  title="Preview selected journey"
                  expanded={previewOpen.value}
                  onChange={previewOpen.onToggle}
                  content={
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={0.75}>
                        <Label variant="outlined">{selectedTemplate.stages.length} stages</Label>
                        <Label variant="outlined">
                          {Math.max(selectedTemplate.stages.length - 1, 0)} routes
                        </Label>
                      </Stack>
                      {selectedTemplate.inquiryLinked && <WorkflowInquiryContext />}
                      {selectedTemplate.stages.map((stage, index) => (
                        <Typography key={stage.code} variant="body2">
                          {index + 1}. {stage.name}
                        </Typography>
                      ))}
                    </Stack>
                  }
                />
              </Stack>
            </FormSectionCard>
            <FormSectionCard icon="mdi:form-select" title="Published forms">
              <Stack spacing={2}>
                <AdmissionDefinitionSelect
                  label="Published inquiry form (optional)"
                  valueId={formik.values.inquiryFormDefinitionId}
                  initialOption={initialInquiryForm}
                  fetchOptions={fetchInquiryForms}
                  onChange={(id) => formik.setFieldValue('inquiryFormDefinitionId', id)}
                  noOptionsText="No published inquiry forms found"
                />
                <ShakingTextField
                  error={Boolean(
                    formik.touched.registrationFormDefinitionId &&
                    formik.errors.registrationFormDefinitionId
                  )}
                >
                  <AdmissionDefinitionSelect
                    label="Published registration form *"
                    valueId={formik.values.registrationFormDefinitionId}
                    initialOption={initialRegistrationForm}
                    fetchOptions={fetchRegistrationForms}
                    onChange={(id) =>
                      formik.setFieldValue('registrationFormDefinitionId', id ?? '')
                    }
                    noOptionsText="No published registration forms found"
                    error={Boolean(
                      formik.touched.registrationFormDefinitionId &&
                      formik.errors.registrationFormDefinitionId
                    )}
                    helperText={
                      (formik.touched.registrationFormDefinitionId &&
                        formik.errors.registrationFormDefinitionId) ||
                      undefined
                    }
                  />
                </ShakingTextField>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<Iconify icon="mdi:open-in-new" />}
                  onClick={() => requestExit('forms')}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Open Admission Form
                </Button>
              </Stack>
            </FormSectionCard>
          </Stack>
        </Box>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => requestExit('close')}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mdi:auto-fix" />}
            onClick={() => formik.handleSubmit()}
          >
            Replace journey
          </Button>
        </Stack>
      </Drawer>
      <ConfirmDialog
        open={discardAction !== null}
        onClose={() => setDiscardAction(null)}
        title="Discard template selections?"
        content="Your template and form selections will be lost."
        action={
          <Button size="small" color="error" variant="contained" onClick={discardAndExit}>
            Discard selections
          </Button>
        }
      />
    </>
  );
}
