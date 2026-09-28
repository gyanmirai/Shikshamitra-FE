'use client';

import type { CreateUpdateAdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Stack,
  Button,
  Drawer,
  Divider,
  Tooltip,
  TextField,
  Accordion,
  IconButton,
  Typography,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { getWorkflowStarterDefinition } from './workflow-template';
import { AdmissionDefinitionSelect } from './admission-definition-select';
import { WorkflowTemplateSelector } from './workflow-builder/components/workflow-template-selector';

import type { WorkflowStarterId } from './workflow-template';
import type { AdmissionDefinitionFetcher } from './use-admission-definition-options';

export type WorkflowDetails = Pick<
  CreateUpdateAdmissionWorkflow,
  'name' | 'code' | 'description'
> & {
  starterJourney?: WorkflowStarterId;
  defaultInquiryFormDefinitionId?: string | null;
  registrationFormDefinitionId?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  saving: boolean;
  title?: string;
  initialValues?: WorkflowDetails;
  submitLabel?: string;
  showStarterJourney?: boolean;
  autoGenerateCode?: boolean;
  closeOnSave?: boolean;
  fetchInquiryForms?: AdmissionDefinitionFetcher;
  fetchRegistrationForms?: AdmissionDefinitionFetcher;
  onSave: (value: WorkflowDetails) => Promise<void>;
};

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .max(128, 'Use 128 characters or fewer')
    .required('Workflow name is required'),
  code: Yup.string()
    .trim()
    .uppercase()
    .matches(/^[A-Z][A-Z0-9_-]*$/, 'Use uppercase letters, numbers, hyphens, or underscores')
    .max(64, 'Use 64 characters or fewer')
    .required('Workflow code is required'),
  description: Yup.string().trim().max(1024, 'Use 1,024 characters or fewer'),
  defaultInquiryFormDefinitionId: Yup.string().nullable(),
  registrationFormDefinitionId: Yup.string()
    .nullable()
    .when('starterJourney', {
      is: (starterJourney: WorkflowStarterId | undefined) =>
        Boolean(starterJourney && starterJourney !== 'empty'),
      then: (field) => field.required('Select a published registration form'),
    }),
});

const EMPTY_VALUES: WorkflowDetails = {
  name: '',
  code: '',
  description: '',
  starterJourney: 'standard',
  defaultInquiryFormDefinitionId: null,
  registrationFormDefinitionId: null,
};

const noFormOptions: AdmissionDefinitionFetcher = async () => ({ data: [], hasMore: false });

const toWorkflowCode = (name: string) => {
  const code = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return (code && !/^[A-Z]/.test(code) ? `WF_${code}` : code).slice(0, 64);
};

type WorkflowStarterDefinition = NonNullable<ReturnType<typeof getWorkflowStarterDefinition>>;

function WorkflowTemplatePreview({ template }: { template: WorkflowStarterDefinition }) {
  const routeCount = Math.max(template.stages.length - 1, 0);

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="subtitle1">{template.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {template.description}
        </Typography>
      </Box>

      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
        <Label variant="outlined">{template.stages.length} stages</Label>
        <Label variant="outlined">{routeCount} routes</Label>
      </Stack>

      <Divider />

      {template.stages.length > 0 ? (
        <Stack spacing={0} aria-label={`${template.name} stage preview`}>
          {template.stages.map((stage, index) => (
            <Stack
              key={stage.code}
              direction="row"
              spacing={1.25}
              alignItems="flex-start"
              sx={{
                position: 'relative',
                pb: index < template.stages.length - 1 ? 1.5 : 0,
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
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  typography: 'caption',
                  fontWeight: 700,
                  '&::after':
                    index < template.stages.length - 1
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
              <Box sx={{ minWidth: 0, pt: 0.25 }}>
                <Typography variant="subtitle2">{stage.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {stage.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {template.bestFor}. Add and arrange stages after creating the draft.
        </Typography>
      )}
    </Stack>
  );
}

export function AdmissionWorkflowDialog({
  open,
  onClose,
  saving,
  title = 'Create workflow',
  submitLabel = 'Create draft',
  initialValues = EMPTY_VALUES,
  showStarterJourney = false,
  autoGenerateCode = false,
  closeOnSave = true,
  fetchInquiryForms = noFormOptions,
  fetchRegistrationForms = noFormOptions,
  onSave,
}: Props) {
  const discard = useBoolean();
  const previewOpen = useBoolean(false);
  const descriptionOpen = useBoolean(false);
  const isMobile = useResponsive('down', 'sm');
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(Boolean(initialValues.code));
  const formik = useFormik<WorkflowDetails>({
    enableReinitialize: true,
    initialValues,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        await onSave({
          name: values.name.trim(),
          code: values.code.trim().toUpperCase(),
          description: values.description?.trim() || undefined,
          starterJourney: values.starterJourney,
          defaultInquiryFormDefinitionId: values.defaultInquiryFormDefinitionId || null,
          registrationFormDefinitionId: values.registrationFormDefinitionId || null,
        });
        if (closeOnSave) {
          helpers.resetForm();
          onClose();
        }
      } catch {
        // The screen owns API problem-detail messaging so the form remains reusable.
      }
    },
  });

  useEffect(() => {
    if (open) setCodeManuallyEdited(Boolean(initialValues.code));
  }, [initialValues.code, open]);

  const close = () => {
    discard.onFalse();
    previewOpen.onFalse();
    descriptionOpen.onFalse();
    formik.resetForm();
    onClose();
  };
  const requestClose = () => {
    if (saving) return;
    if (formik.dirty) discard.onTrue();
    else close();
  };

  const selectedTemplate =
    getWorkflowStarterDefinition(formik.values.starterJourney) ??
    getWorkflowStarterDefinition('standard')!;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={requestClose}
        PaperProps={{
          sx: {
            width: { xs: 1, sm: showStarterJourney ? 680 : 560 },
            maxWidth: 1,
            height: '100dvh',
            display: 'flex',
            overflow: 'hidden',
          },
          role: 'dialog',
          'aria-labelledby': 'admission-workflow-drawer-title',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography id="admission-workflow-drawer-title" variant="h6" component="div">
              {title}
            </Typography>
          </Box>
          {showStarterJourney && !descriptionOpen.value && !formik.values.description && (
            <Tooltip title="Add an optional workflow description">
              <IconButton
                size="small"
                aria-label="Add workflow description"
                onClick={descriptionOpen.onTrue}
                sx={{ width: { xs: 44, sm: 36 }, height: { xs: 44, sm: 36 } }}
              >
                <Iconify icon="mdi:text-box-plus-outline" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            size="small"
            aria-label="Close workflow editor"
            onClick={requestClose}
            disabled={saving}
            sx={{ width: { xs: 44, sm: 36 }, height: { xs: 44, sm: 36 } }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 2.5 } }}
        >
          <Stack spacing={2}>
            <Stack spacing={1.5}>
              {!showStarterJourney && <Typography variant="subtitle2">Workflow details</Typography>}
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                }}
              >
                <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
                  <TextField
                    fullWidth
                    autoFocus={!isMobile}
                    size="small"
                    label="Workflow name *"
                    placeholder="For example, Fresh Admission"
                    {...formik.getFieldProps('name')}
                    onChange={(event) => {
                      const { value } = event.target;
                      formik.setFieldValue('name', value);
                      if (autoGenerateCode && !codeManuallyEdited) {
                        formik.setFieldValue('code', toWorkflowCode(value));
                      }
                    }}
                    error={Boolean(formik.touched.name && formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </ShakingTextField>
                <ShakingTextField error={Boolean(formik.touched.code && formik.errors.code)}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Workflow code *"
                    placeholder="WF-001"
                    {...formik.getFieldProps('code')}
                    onChange={(event) => {
                      setCodeManuallyEdited(true);
                      formik.setFieldValue('code', event.target.value.toUpperCase());
                    }}
                    error={Boolean(formik.touched.code && formik.errors.code)}
                    helperText={formik.touched.code && formik.errors.code}
                  />
                </ShakingTextField>
              </Box>
              {(!showStarterJourney || descriptionOpen.value || formik.values.description) && (
                <ShakingTextField
                  error={Boolean(formik.touched.description && formik.errors.description)}
                >
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                    label="Description (optional)"
                    placeholder="Explain when the school should use this journey."
                    {...formik.getFieldProps('description')}
                    error={Boolean(formik.touched.description && formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </ShakingTextField>
              )}
            </Stack>
            {showStarterJourney && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">Published forms</Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        sm: 'repeat(2, minmax(0, 1fr))',
                      },
                    }}
                  >
                    {formik.values.starterJourney !== 'empty' ? (
                      <ShakingTextField
                        error={Boolean(
                          formik.touched.registrationFormDefinitionId &&
                          formik.errors.registrationFormDefinitionId
                        )}
                      >
                        <AdmissionDefinitionSelect
                          label="Registration form *"
                          valueId={formik.values.registrationFormDefinitionId ?? null}
                          fetchOptions={fetchRegistrationForms}
                          onChange={(id) =>
                            formik.setFieldValue('registrationFormDefinitionId', id)
                          }
                          noOptionsText="No published registration forms found"
                          error={Boolean(
                            formik.touched.registrationFormDefinitionId &&
                            formik.errors.registrationFormDefinitionId
                          )}
                          helperText={
                            formik.touched.registrationFormDefinitionId &&
                            formik.errors.registrationFormDefinitionId
                          }
                        />
                      </ShakingTextField>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        A blank workflow can attach a registration form after its Form stage is
                        added.
                      </Typography>
                    )}
                    <AdmissionDefinitionSelect
                      label="Inquiry form (optional)"
                      valueId={formik.values.defaultInquiryFormDefinitionId ?? null}
                      fetchOptions={fetchInquiryForms}
                      onChange={(id) => formik.setFieldValue('defaultInquiryFormDefinitionId', id)}
                      noOptionsText="No published inquiry forms found"
                    />
                  </Box>
                </Stack>
                <Divider />
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">Choose a workflow template</Typography>
                  <WorkflowTemplateSelector
                    includeBlank
                    columns={1}
                    value={formik.values.starterJourney ?? 'standard'}
                    onChange={(value) => formik.setFieldValue('starterJourney', value)}
                  />
                  <Accordion
                    disableGutters
                    expanded={previewOpen.value}
                    onChange={previewOpen.onToggle}
                    variant="outlined"
                    sx={{ borderRadius: '8px !important', '&:before': { display: 'none' } }}
                  >
                    <AccordionSummary
                      expandIcon={<Iconify icon="mdi:chevron-down" width={20} />}
                      aria-controls="workflow-journey-preview"
                      sx={{ minHeight: { xs: 56, sm: 52 }, px: 1.5 }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Iconify icon="mdi:format-list-numbered" width={20} />
                        <Box>
                          <Typography variant="subtitle2">Preview journey</Typography>
                          <Typography variant="caption" color="text.secondary">
                            See the stages and routes for the selected template.
                          </Typography>
                        </Box>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails id="workflow-journey-preview" sx={{ p: 2 }}>
                      <WorkflowTemplatePreview template={selectedTemplate} />
                    </AccordionDetails>
                  </Accordion>
                </Stack>
              </>
            )}
          </Stack>
        </Box>
        <DialogActions
          sx={{
            p: { xs: 1.5, sm: 2 },
            gap: 1,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '& .MuiButton-root': {
              minHeight: { xs: 44, sm: 36 },
              flex: { xs: 1, sm: 'initial' },
            },
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={requestClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            size="small"
            loading={saving}
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => formik.handleSubmit()}
            sx={{
              bgcolor: 'text.primary',
              color: 'background.paper',
              '&:hover': { bgcolor: 'text.secondary' },
            }}
          >
            {submitLabel}
          </LoadingButton>
        </DialogActions>
      </Drawer>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard workflow details?"
        content="The workflow information you entered will be lost."
        action={
          <Button color="error" variant="contained" size="small" onClick={close}>
            Discard details
          </Button>
        }
      />
    </>
  );
}
