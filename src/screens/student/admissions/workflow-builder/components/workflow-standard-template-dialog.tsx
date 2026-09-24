'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
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
  const routeCount = Math.max(selectedTemplate.stages.length - 1, 0);
  const publishGuidance =
    draftForms.length > 0
      ? `${draftForms.length} draft form${draftForms.length === 1 ? ' is' : 's are'} available, but must be published before use.`
      : 'Create and publish an application form before applying this journey.';

  const previewPanel = (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'background.default' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1">Preview</Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedTemplate.bestFor}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} flexShrink={0}>
            <Label variant="outlined">{selectedTemplate.stages.length} stages</Label>
            <Label variant="outlined">{routeCount} routes</Label>
          </Stack>
        </Stack>
        <Divider />
        <Stack spacing={0} aria-label={`${selectedTemplate.name} stages`}>
          {selectedTemplate.stages.map((stage, index) => (
            <Stack
              key={stage.code}
              direction="row"
              spacing={1.25}
              alignItems="flex-start"
              sx={{
                position: 'relative',
                pb: index < selectedTemplate.stages.length - 1 ? 1.5 : 0,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  zIndex: 1,
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  display: 'grid',
                  borderRadius: '50%',
                  placeItems: 'center',
                  color: 'text.primary',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  typography: 'caption',
                  fontWeight: 700,
                  '&::after':
                    index < selectedTemplate.stages.length - 1
                      ? {
                          content: '""',
                          position: 'absolute',
                          top: 28,
                          bottom: 0,
                          left: 13.5,
                          width: '1px',
                          bgcolor: 'divider',
                        }
                      : undefined,
                }}
              >
                {index + 1}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">{stage.name}</Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
        <Divider />
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Application form
          </Typography>
          <ShakingTextField
            error={Boolean(formik.touched.formDefinitionId && formik.errors.formDefinitionId)}
          >
            <CustomSelect
              label="Published application form *"
              value={formik.values.formDefinitionId}
              options={formOptions}
              onChange={(value) => formik.setFieldValue('formDefinitionId', String(value))}
              onBlur={() => formik.setFieldTouched('formDefinitionId', true)}
              error={Boolean(formik.touched.formDefinitionId && formik.errors.formDefinitionId)}
              helperText={
                (formik.touched.formDefinitionId && formik.errors.formDefinitionId) ||
                'Attached to the application form stage.'
              }
              disabled={loading || loadError || forms.length === 0}
              disabledValues={unavailableForms.map((form) => form.id)}
              disabledLabel="Only published forms can be used"
              isLoading={loading}
              isSearch={forms.length > 7}
              noOptionsMessage="No application forms found"
            />
          </ShakingTextField>
        </Box>

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
            Application forms could not be loaded. Try again before replacing the journey.
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
                Open Admission Forms
              </Button>
            }
          >
            {publishGuidance}
          </Alert>
        )}
      </Stack>
    </Paper>
  );

  return (
    <CustomDialog
      open={open}
      handleClose={closeDialog}
      title="Choose a workflow template"
      maxWidth="lg"
      paperProps={{
        sx: {
          width: { xs: 'calc(100% - 24px)', sm: 'calc(100% - 64px)' },
          maxHeight: { xs: 'calc(100% - 24px)', sm: 'calc(100% - 64px)' },
          m: { xs: 1.5, sm: 4 },
          '& > form > .MuiBox-root:first-of-type .MuiIconButton-root': {
            width: 44,
            height: 44,
          },
        },
      }}
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()} sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Choose a starting journey for this draft.
          </Typography>
          <Alert severity="warning" icon={<Iconify icon="mdi:alert-outline" />}>
            This replaces the current stages and routes.
          </Alert>

          <Box
            sx={{
              gap: 2,
              display: 'grid',
              alignItems: 'start',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'minmax(0, 1.2fr) minmax(360px, 0.8fr)',
              },
            }}
          >
            <Stack spacing={1.5} sx={{ minWidth: 0 }}>
              <Box>
                <Typography variant="subtitle1">Templates</Typography>
                <Typography variant="body2" color="text.secondary">
                  Select the closest starting point. You can edit every generated stage before
                  publishing.
                </Typography>
              </Box>
              <WorkflowTemplateSelector
                value={formik.values.templateId}
                onChange={(value) => formik.setFieldValue('templateId', value)}
                columns={2}
                onPreviewSelected={() =>
                  document
                    .getElementById('workflow-template-preview')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              />
            </Stack>
            <Box id="workflow-template-preview" tabIndex={-1} sx={{ minWidth: 0 }}>
              {previewPanel}
            </Box>
          </Box>
        </Stack>
      </DialogScrollContent>
      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          gap: 1,
          borderTop: 1,
          borderColor: 'divider',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            aria-hidden
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              display: { xs: 'none', sm: 'grid' },
              placeItems: 'center',
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
            }}
          >
            <Iconify icon={selectedTemplate.icon} width={20} />
          </Box>
          <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" noWrap>
              {selectedTemplate.name} selected
            </Typography>
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          sx={{ ml: { xs: 'auto', sm: 0 }, width: { xs: 1, sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={closeDialog}
            sx={{ minHeight: 44, flex: { xs: 1, sm: 'initial' } }}
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
            sx={{
              minHeight: 44,
              flex: { xs: 1, sm: 'initial' },
              bgcolor: 'text.primary',
              color: 'background.paper',
              '&:hover': { bgcolor: 'text.secondary' },
            }}
          >
            Replace journey
          </LoadingButton>
        </Stack>
      </DialogActions>
    </CustomDialog>
  );
}
