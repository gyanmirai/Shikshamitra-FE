'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Divider,
  Typography,
  DialogActions,
} from '@mui/material';

import { WorkflowTemplateSelector } from './workflow-template-selector';
import {
  WORKFLOW_TEMPLATE_IDS,
  ADMISSION_WORKFLOW_TEMPLATES,
  getWorkflowTemplateDefinition,
} from '../../workflow-template';

import type { WorkflowTemplateId } from '../../workflow-template';

type Props = {
  open: boolean;
  forms: AdmissionForm[];
  loading: boolean;
  loadError: boolean;
  onClose: () => void;
  initialTemplateId?: WorkflowTemplateId;
  onApply: (templateId: WorkflowTemplateId, formDefinitionId: string) => void;
  onRetry: () => void;
  onOpenFormBuilder: () => void;
};

const FORM_STATUS_LABELS = ['Draft', 'Published', 'Archived'] as const;

export function WorkflowStandardTemplateDialog({
  open,
  forms,
  loading,
  loadError,
  onClose,
  initialTemplateId = 'standard',
  onApply,
  onRetry,
  onOpenFormBuilder,
}: Props) {
  const publishedForms = forms.filter((form) => form.status === 1);
  const unavailableForms = forms.filter((form) => form.status !== 1);
  const draftForms = forms.filter((form) => form.status === 0);
  const initialValues = {
    templateId: initialTemplateId,
    formDefinitionId: publishedForms.length === 1 ? (publishedForms[0]?.id ?? '') : '',
  };
  const schema = Yup.object({
    templateId: Yup.string().oneOf(WORKFLOW_TEMPLATE_IDS).required('Select a journey template'),
    formDefinitionId: Yup.string()
      .required('Select a published application form')
      .oneOf(
        publishedForms.map((form) => form.id),
        'Select a published application form'
      ),
  });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: schema,
    onSubmit: (values) => {
      onApply(values.templateId, values.formDefinitionId);
      formik.resetForm({ values: initialValues });
      onClose();
    },
  });
  const closeDialog = () => {
    formik.resetForm({ values: initialValues });
    onClose();
  };
  const formOptions = forms.map((form) => ({
    value: form.id,
    label: `${form.name} · Version ${form.version} · ${FORM_STATUS_LABELS[form.status]}`,
  }));
  const noPublishedForms = !loading && !loadError && publishedForms.length === 0;
  const selectedTemplate =
    getWorkflowTemplateDefinition(formik.values.templateId) ?? ADMISSION_WORKFLOW_TEMPLATES[0];
  const publishGuidance =
    draftForms.length > 0
      ? `${draftForms.length} draft form${draftForms.length === 1 ? ' is' : 's are'} listed in the selector. Publish ${
          draftForms.length === 1 ? 'it' : 'one'
        } before applying this journey.`
      : 'Create and publish an application form before applying this journey.';

  return (
    <CustomDialog
      open={open}
      handleClose={closeDialog}
      title="Choose a workflow template"
      maxWidth="lg"
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Start from a school-ready journey, then edit its stages, rules, and routes in the
            Workflow Builder.
          </Typography>
          <Alert severity="warning">
            Applying the journey replaces every stage and next-step path currently on this draft.
          </Alert>

          <Box
            sx={{
              gap: 2,
              display: 'grid',
              alignItems: 'start',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.25fr) minmax(340px, 0.75fr)' },
            }}
          >
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="subtitle1">Choose the journey</Typography>
                <Typography variant="body2" color="text.secondary">
                  These are starting points. Every generated stage remains editable before
                  publication.
                </Typography>
              </Box>

              <WorkflowTemplateSelector
                value={formik.values.templateId}
                onChange={(value) => formik.setFieldValue('templateId', value)}
                columns={2}
              />

              <Divider />

              <Box>
                <Typography variant="subtitle1">Choose the application form</Typography>
                <Typography variant="body2" color="text.secondary">
                  Draft forms remain visible for clarity, but only published versions can be used.
                </Typography>
              </Box>

              <ShakingTextField
                error={Boolean(formik.touched.formDefinitionId && formik.errors.formDefinitionId)}
              >
                <CustomSelect
                  label="Application form *"
                  value={formik.values.formDefinitionId}
                  options={formOptions}
                  onChange={(value) => formik.setFieldValue('formDefinitionId', String(value))}
                  onBlur={() => formik.setFieldTouched('formDefinitionId', true)}
                  error={Boolean(formik.touched.formDefinitionId && formik.errors.formDefinitionId)}
                  helperText={
                    (formik.touched.formDefinitionId && formik.errors.formDefinitionId) ||
                    'The selected published version is attached to the application form stage.'
                  }
                  disabled={loading || loadError || forms.length === 0}
                  disabledValues={unavailableForms.map((form) => form.id)}
                  disabledLabel="Only published forms can be used"
                  isLoading={loading}
                  isSearch={forms.length > 7}
                  noOptionsMessage="No application forms found"
                />
              </ShakingTextField>

              {loadError && (
                <Alert
                  severity="error"
                  action={
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<Iconify icon="mdi:refresh" />}
                      onClick={onRetry}
                    >
                      Retry
                    </Button>
                  }
                >
                  Application forms could not be loaded. Try again before applying the journey.
                </Alert>
              )}

              {noPublishedForms && (
                <Alert
                  severity="info"
                  action={
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<Iconify icon="mdi:open-in-new" />}
                      onClick={() => {
                        closeDialog();
                        onOpenFormBuilder();
                      }}
                    >
                      Open Form Builder
                    </Button>
                  }
                >
                  {publishGuidance}
                </Alert>
              )}
            </Stack>

            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
              <Stack spacing={1.25}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="subtitle1">Journey preview</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedTemplate.bestFor}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.75}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${selectedTemplate.stages.length} stages`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${Math.max(selectedTemplate.stages.length - 1, 0)} routes`}
                    />
                  </Stack>
                </Stack>
                <Divider />
                <Stack spacing={1} aria-label={`${selectedTemplate.name} stages`}>
                  {selectedTemplate.stages.map((stage, index) => (
                    <Stack key={stage.code} direction="row" spacing={1.25} alignItems="flex-start">
                      <Box
                        aria-hidden
                        sx={{
                          width: 26,
                          height: 26,
                          flexShrink: 0,
                          display: 'grid',
                          border: 1,
                          borderRadius: '50%',
                          placeItems: 'center',
                          color: 'text.primary',
                          borderColor: 'divider',
                          bgcolor: 'action.hover',
                          typography: 'caption',
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">{stage.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stage.description}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={closeDialog}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          size="small"
          disabled={loading || loadError || publishedForms.length === 0}
          startIcon={<Iconify icon="mdi:auto-fix" />}
          onClick={() => formik.handleSubmit()}
        >
          Apply template
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
