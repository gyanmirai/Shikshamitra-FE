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
import CustomAccordion from 'src/components/custom-accordian';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Paper,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { getWorkflowStarterDefinition } from './workflow-template';
import { WorkflowTemplateSelector } from './workflow-builder/components/workflow-template-selector';

import type { WorkflowStarterId } from './workflow-template';

export type WorkflowDetails = Pick<
  CreateUpdateAdmissionWorkflow,
  'name' | 'code' | 'description'
> & { starterJourney?: WorkflowStarterId };

type Props = {
  open: boolean;
  onClose: () => void;
  saving: boolean;
  title?: string;
  initialValues?: WorkflowDetails;
  submitLabel?: string;
  showStarterJourney?: boolean;
  autoGenerateCode?: boolean;
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
});

const EMPTY_VALUES: WorkflowDetails = {
  name: '',
  code: '',
  description: '',
  starterJourney: 'standard',
};

const CREATE_WORKFLOW_GUIDANCE =
  'Create the draft, choose a starting point, then review every stage before publishing.';

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
  onSave,
}: Props) {
  const discard = useBoolean();
  const mobilePreview = useBoolean(true);
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
        });
        helpers.resetForm();
        onClose();
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
    formik.resetForm();
    onClose();
  };
  const requestClose = () => {
    if (formik.dirty && !saving) discard.onTrue();
    else close();
  };

  const dialogTitle = showStarterJourney ? (
    <AdmissionDialogTitle
      title={title}
      helpText={CREATE_WORKFLOW_GUIDANCE}
      helpLabel="About creating a workflow"
    />
  ) : (
    title
  );
  const selectedTemplate =
    getWorkflowStarterDefinition(formik.values.starterJourney) ??
    getWorkflowStarterDefinition('standard')!;

  return (
    <>
      <CustomDialog
        open={open}
        handleClose={requestClose}
        title={dialogTitle}
        maxWidth={showStarterJourney ? 'md' : 'sm'}
        fullScreen={showStarterJourney && isMobile}
        paperProps={
          showStarterJourney
            ? {
                sx: {
                  maxHeight: { sm: 'calc(100% - 64px)' },
                  m: { sm: 4 },
                  borderRadius: { xs: 0, sm: 2 },
                },
              }
            : undefined
        }
      >
        <DialogScrollContent onSubmit={() => formik.handleSubmit()} sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack spacing={2}>
            {showStarterJourney && (
              <Typography variant="body2" color="text.secondary">
                Name the workflow and choose a starting point.
              </Typography>
            )}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Workflow details</Typography>
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
                    autoFocus
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
                    placeholder="FRESH_ADMISSION"
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
            </Stack>
            {showStarterJourney && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="subtitle2">Starting point</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select the closest school process. You can edit every generated stage and
                      route after the draft is created.
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      alignItems: 'start',
                      gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        md: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)',
                      },
                    }}
                  >
                    <WorkflowTemplateSelector
                      includeBlank
                      columns={1}
                      value={formik.values.starterJourney ?? 'standard'}
                      onChange={(value) => formik.setFieldValue('starterJourney', value)}
                    />
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        minWidth: 0,
                        display: { xs: 'none', md: 'block' },
                        bgcolor: 'background.default',
                      }}
                    >
                      <WorkflowTemplatePreview template={selectedTemplate} />
                    </Paper>
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <CustomAccordion
                        title="Preview selected template"
                        expanded={mobilePreview.value}
                        onChange={mobilePreview.onToggle}
                        content={<WorkflowTemplatePreview template={selectedTemplate} />}
                      />
                    </Box>
                  </Box>
                </Stack>
              </>
            )}
          </Stack>
        </DialogScrollContent>
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
      </CustomDialog>
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
