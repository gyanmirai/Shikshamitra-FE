'use client';

import type { Ref } from 'react';
import type { FormikProps, FormikHelpers } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  CreateUpdateAdmissionWorkflow,
} from 'src/redux/student/admissions/admission-workflows-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { useRef, useMemo, useState, useEffect, useImperativeHandle } from 'react';
import { useStudentDrawerExit } from 'src/screens/student/components/use-student-drawer-exit';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import {
  Box,
  Card,
  Stack,
  Button,
  Drawer,
  Divider,
  TextField,
  Accordion,
  IconButton,
  Typography,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { getWorkflowStarterDefinition } from './workflow-template';
import { DUPLICATE_WORKFLOW_NAME_CODE } from './workflow-name-error';
import { AdmissionDefinitionSelect } from './admission-definition-select';
import { WorkflowSetupProgress } from './workflow-builder/components/workflow-setup-progress';
import { WorkflowInquiryContext } from './workflow-builder/components/workflow-inquiry-context';
import { WorkflowTemplateSelector } from './workflow-builder/components/workflow-template-selector';

import type { WorkflowStarterId } from './workflow-template';
import type {
  AdmissionDefinitionOption,
  AdmissionDefinitionFetcher,
} from './use-admission-definition-options';

export type WorkflowDetails = Pick<
  CreateUpdateAdmissionWorkflow,
  'name' | 'code' | 'description'
> & {
  starterJourney?: WorkflowStarterId;
  defaultInquiryFormDefinitionId?: string | null;
  registrationFormDefinitionId?: string | null;
};

export type WorkflowDetailsFormState = { dirty: boolean; busy: boolean };

type Props = {
  open: boolean;
  onClose: () => void;
  saving: boolean;
  title?: string;
  initialValues?: WorkflowDetails;
  submitLabel?: string;
  continueLabel?: string;
  showStarterJourney?: boolean;
  inline?: boolean;
  closeOnSave?: boolean;
  fetchInquiryForms?: AdmissionDefinitionFetcher;
  fetchRegistrationForms?: AdmissionDefinitionFetcher;
  initialRegistrationForm?: AdmissionDefinitionOption | null;
  currentJourney?: { stages: AdmissionWorkflowStage[]; transitions: AdmissionWorkflowTransition[] };
  closeRequestRef?: Ref<() => void>;
  resetFormRef?: Ref<() => void>;
  onFormStateChange?: (state: WorkflowDetailsFormState) => void;
  onSave: (value: WorkflowDetails) => Promise<void | (() => void)>;
};

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .max(128, 'Use 128 characters or fewer')
    .required('Workflow name is required'),
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

const duplicateNameMessage = 'A workflow with this name already exists. Enter a different name.';

function showWorkflowNameError(
  error: unknown,
  formik: Pick<FormikHelpers<WorkflowDetails>, 'setStatus'> | null
) {
  if (parseApiProblemDetail(error).errorCode === DUPLICATE_WORKFLOW_NAME_CODE) {
    formik?.setStatus(duplicateNameMessage);
  }
}

function WorkflowNameField({
  formik,
  autoFocus,
}: {
  formik: FormikProps<WorkflowDetails>;
  autoFocus: boolean;
}) {
  const hasNameConflict = formik.status === duplicateNameMessage;
  const message = hasNameConflict
    ? duplicateNameMessage
    : formik.touched.name && formik.errors.name;

  return (
    <ShakingTextField error={Boolean(message)}>
      <TextField
        fullWidth
        autoFocus={autoFocus}
        size="small"
        label="Workflow name *"
        placeholder="For example, fresh admission"
        {...formik.getFieldProps('name')}
        onChange={(event) => {
          if (hasNameConflict) formik.setStatus(undefined);
          formik.handleChange(event);
        }}
        error={Boolean(message)}
        helperText={message}
        slotProps={{ formHelperText: { role: hasNameConflict ? 'alert' : undefined } }}
      />
    </ShakingTextField>
  );
}

function WorkflowDetailsDirtyState({ dirty, busy }: WorkflowDetailsFormState) {
  const router = useRouter();
  const { confirmation } = useUnsavedNavigation(dirty, {
    push: router.push,
    guardContextChanges: true,
    blockNavigation: busy,
  });
  return confirmation;
}

function WorkflowDetailsFormStatus({
  dirty,
  busy,
  onChange,
}: WorkflowDetailsFormState & { onChange?: (state: WorkflowDetailsFormState) => void }) {
  useEffect(() => {
    onChange?.({ dirty, busy });
  }, [busy, dirty, onChange]);

  return onChange ? null : <WorkflowDetailsDirtyState dirty={dirty} busy={busy} />;
}

const CREATE_STARTER_IDS: readonly WorkflowStarterId[] = ['standard', 'empty'];

function WorkflowJourneyCounts({
  stageCount,
  routeCount,
}: {
  stageCount: number;
  routeCount: number;
}) {
  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" aria-live="polite">
      <Label variant="outlined">{stageCount} Stages</Label>
      <Label variant="outlined">{routeCount} Routes</Label>
    </Stack>
  );
}

function WorkflowTemplatePreview({
  template,
  routeCount = Math.max(template.stages.length - 1, 0),
  showCounts = true,
}: {
  template: {
    name: string;
    bestFor: string;
    inquiryLinked?: boolean;
    stages: ReadonlyArray<{ code: string; name: string; description?: string }>;
  };
  routeCount?: number;
  showCounts?: boolean;
}) {
  return (
    <Stack spacing={2} aria-live="polite">
      <Box>
        <Typography variant="subtitle1">{template.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {template.bestFor}
        </Typography>
      </Box>

      {showCounts && (
        <WorkflowJourneyCounts stageCount={template.stages.length} routeCount={routeCount} />
      )}

      {template.inquiryLinked && <WorkflowInquiryContext />}

      {template.stages.length > 0 ? (
        <Stack spacing={0} aria-label={`${template.name} Stage Preview`}>
          {template.stages.map((stage, index) => (
            <Box key={stage.code}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
                sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}
              >
                <Box
                  aria-hidden
                  sx={{
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
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2">{stage.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stage.description}
                  </Typography>
                </Box>
              </Stack>
              {index < template.stages.length - 1 && (
                <Box
                  aria-hidden
                  sx={{ ml: '28px', height: 14, borderLeft: 2, borderColor: 'divider' }}
                />
              )}
            </Box>
          ))}
        </Stack>
      ) : (
        <Stack
          alignItems="center"
          spacing={1}
          sx={{ p: 3, borderRadius: 1.5, bgcolor: 'background.neutral', textAlign: 'center' }}
        >
          <Box sx={{ color: 'text.secondary' }}>
            <Iconify icon="mdi:sitemap-outline" width={28} />
          </Box>
          <Typography variant="subtitle2">No Stages Yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Add and arrange stages in Build journey.
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

const normalizeWorkflowDetails = (values: WorkflowDetails): WorkflowDetails => ({
  name: values.name.trim(),
  code: values.code.trim().toUpperCase(),
  description: values.description?.trim() || undefined,
  starterJourney: values.starterJourney,
  defaultInquiryFormDefinitionId: values.defaultInquiryFormDefinitionId || null,
  registrationFormDefinitionId: values.registrationFormDefinitionId || null,
});

function CreateWorkflowDialog({
  inline = false,
  onClose,
  saving,
  title = 'Create workflow',
  continueLabel = 'Save & Continue',
  initialValues = EMPTY_VALUES,
  closeOnSave = false,
  fetchRegistrationForms = noFormOptions,
  initialRegistrationForm,
  currentJourney,
  closeRequestRef,
  resetFormRef,
  onFormStateChange,
  onSave,
}: Props) {
  const discard = useBoolean();
  const isMobile = useResponsive('down', 'sm');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const formikRef = useRef<FormikProps<WorkflowDetails> | null>(null);
  const [replacement, setReplacement] = useState<{
    values: WorkflowDetails;
    setIsLoading: (loading: boolean) => void;
  } | null>(null);
  const busy = saving || submitting;
  const normalizedInitialValues = useMemo(
    () => ({
      ...initialValues,
      description: initialValues.description ?? '',
    }),
    [initialValues]
  );

  const close = () => {
    discard.onFalse();
    onClose();
  };
  const requestClose = () => {
    if (busy || replacement) return;
    if (formikRef.current?.dirty) discard.onTrue();
    else close();
  };
  useImperativeHandle(closeRequestRef, () => requestClose);
  useImperativeHandle(resetFormRef, () => () => formikRef.current?.resetForm(), []);
  const persistDetails = async (
    values: WorkflowDetails,
    setIsLoading: (loading: boolean) => void
  ) => {
    if (submittingRef.current || saving) return;
    submittingRef.current = true;
    setSubmitting(true);
    setIsLoading(true);
    let saved = false;
    try {
      await onSave({
        ...normalizeWorkflowDetails(values),
        defaultInquiryFormDefinitionId: inline ? values.defaultInquiryFormDefinitionId : null,
      });
      saved = true;
      if (closeOnSave || inline) close();
    } catch (error) {
      showWorkflowNameError(error, formikRef.current);
    } finally {
      // A successful create navigates to the builder. Keep Continue locked until unmount.
      if (!saved || closeOnSave || inline) {
        submittingRef.current = false;
        setSubmitting(false);
        setIsLoading(false);
      }
    }
  };
  const continueToJourney = async (
    _isLastStep: boolean,
    values: WorkflowDetails,
    _formik: FormikProps<WorkflowDetails>,
    setIsLoading: (loading: boolean) => void
  ) => {
    if (busy || replacement) return;
    if (
      inline &&
      values.starterJourney !== undefined &&
      (currentJourney?.stages.length || currentJourney?.transitions.length)
    ) {
      setReplacement({ values, setIsLoading });
      return;
    }
    await persistDetails(values, setIsLoading);
  };
  const detailsSchema = inline
    ? schema.shape({
        registrationFormDefinitionId: Yup.string()
          .nullable()
          .when('starterJourney', {
            is: (starterJourney: WorkflowStarterId | undefined) =>
              starterJourney
                ? starterJourney !== 'empty'
                : Boolean(currentJourney?.stages.some((stage) => stage.stageType === 1)),
            then: (field) => field.required('Select a published registration form'),
          }),
      })
    : schema;

  return (
    <>
      <Card
        component="section"
        aria-label={title}
        aria-busy={busy}
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            '& > div': {
              minWidth: 0,
              minHeight: 0,
              overflow: 'hidden',
            },
            '& > div > form > div:last-child': {
              borderTop: 1,
              borderColor: 'divider',
              px: { xs: 1.5, sm: 2 },
              py: 1,
            },
          }}
        >
          <CustomStepperWithFormik
            initialValues={normalizedInitialValues}
            steps={['Workflow details', 'Build journey']}
            activeStep={0}
            validationSchema={detailsSchema}
            scrollbarHeight="auto"
            showSaveButton={false}
            nextButtonLabel={inline ? continueLabel : 'Continue'}
            onCancel={requestClose}
            handleBack={() => undefined}
            handleNext={continueToJourney}
            renderProgress={({ busy: stepperBusy, submitCurrentStep }) => (
              <WorkflowSetupProgress
                activeStep={0}
                disabled={stepperBusy || Boolean(replacement)}
                onContinueToJourney={inline ? submitCurrentStep : undefined}
              />
            )}
            saveAndNextButtonProps={{ loading: busy, size: 'small' }}
            backButtonProps={{ size: 'small' }}
            renderItem={({ formik }) => {
              formikRef.current = formik;
              const keepingJourney = inline && formik.values.starterJourney === undefined;
              const selectedTemplate = keepingJourney
                ? {
                    name: 'Current journey',
                    bestFor:
                      'Your existing stages and routes are preserved unless you choose a template.',
                    stages: [...(currentJourney?.stages ?? [])].sort(
                      (a, b) => a.displayOrder - b.displayOrder
                    ),
                  }
                : (getWorkflowStarterDefinition(formik.values.starterJourney) ??
                  getWorkflowStarterDefinition('standard')!);
              const showRegistrationForm = keepingJourney
                ? Boolean(currentJourney?.stages.some((stage) => stage.stageType === 1))
                : formik.values.starterJourney !== 'empty';
              return (
                <Box
                  sx={{
                    width: 1,
                    minWidth: 0,
                    boxSizing: 'border-box',
                    py: 2,
                    px: { xs: 1, sm: 2 },
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        lg: 'minmax(0, 7fr) minmax(0, 5fr)',
                      },
                      alignItems: 'stretch',
                    }}
                  >
                    <WorkflowDetailsFormStatus
                      dirty={formik.dirty}
                      busy={busy || Boolean(replacement)}
                      onChange={onFormStateChange}
                    />
                    <FormSectionCard
                      icon="mdi:clipboard-text-outline"
                      title="Workflow Details"
                      descriptionTooltip={
                        inline
                          ? 'Keep your current journey, or choose a template to replace its stages and routes when saving.'
                          : 'Choose a starting journey and a published registration form. You can edit each stage in Build Journey.'
                      }
                    >
                      <Stack spacing={1.5}>
                        <WorkflowTemplateSelector
                          includeBlank
                          columns={2}
                          allowedIds={CREATE_STARTER_IDS}
                          showCounts={false}
                          value={
                            inline
                              ? formik.values.starterJourney
                              : (formik.values.starterJourney ?? 'standard')
                          }
                          onChange={(value) => formik.setFieldValue('starterJourney', value)}
                        />
                        {inline && !keepingJourney && (
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<Iconify icon="mdi:arrow-left" />}
                            onClick={() => formik.setFieldValue('starterJourney', undefined)}
                          >
                            Keep Current Journey
                          </Button>
                        )}
                      </Stack>
                      <Divider />
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle2">Form Details</Typography>
                        <WorkflowNameField formik={formik} autoFocus={!isMobile} />
                        <ShakingTextField
                          error={Boolean(formik.touched.description && formik.errors.description)}
                        >
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            size="small"
                            label="Description"
                            placeholder="Explain when the school should use this journey."
                            {...formik.getFieldProps('description')}
                            error={Boolean(formik.touched.description && formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                          />
                        </ShakingTextField>
                        {showRegistrationForm ? (
                          <ShakingTextField
                            error={Boolean(
                              formik.touched.registrationFormDefinitionId &&
                              formik.errors.registrationFormDefinitionId
                            )}
                          >
                            <AdmissionDefinitionSelect
                              label="Registration form *"
                              valueId={formik.values.registrationFormDefinitionId ?? null}
                              initialOption={initialRegistrationForm}
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
                            In Step 2: Build Journey, add a stage with Stage Type set to Form, then
                            select a published registration form. This adds the registration form to
                            your admission journey.
                          </Typography>
                        )}
                      </Stack>
                    </FormSectionCard>
                    <FormSectionCard
                      icon="mdi:sitemap-outline"
                      title="Journey Preview"
                      action={
                        <WorkflowJourneyCounts
                          stageCount={selectedTemplate.stages.length}
                          routeCount={
                            keepingJourney
                              ? (currentJourney?.transitions.length ?? 0)
                              : Math.max(selectedTemplate.stages.length - 1, 0)
                          }
                        />
                      }
                    >
                      <WorkflowTemplatePreview template={selectedTemplate} showCounts={false} />
                    </FormSectionCard>
                  </Box>
                </Box>
              );
            }}
          />
        </Box>
      </Card>
      <ConfirmDialog
        open={Boolean(replacement)}
        onClose={() => {
          if (!busy) setReplacement(null);
        }}
        disableBackdropClick
        disableEscapeKeyDown={busy}
        disableCancel={busy}
        title="Replace Current Journey?"
        content={
          replacement?.values.starterJourney === 'empty'
            ? 'Start a blank journey in the builder. The replacement can be saved after you add a final Admission decision.'
            : 'Saving this template replaces all current stages and routes, including custom settings and unsaved journey changes. Your inquiry form stays unchanged.'
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={busy}
            onClick={async () => {
              if (!replacement || busy) return;
              await persistDetails(replacement.values, replacement.setIsLoading);
              setReplacement(null);
            }}
          >
            {replacement?.values.starterJourney === 'empty'
              ? 'Replace & Continue'
              : 'Replace & Save'}
          </LoadingButton>
        }
      />
      {discard.value && renderUnsavedConfirmation(discard.onFalse, close, { busy })}
    </>
  );
}

export function AdmissionWorkflowDialog(props: Props) {
  const { showStarterJourney, open, inline } = props;
  if (showStarterJourney || inline) {
    return open ? <CreateWorkflowDialog {...props} /> : null;
  }
  return <WorkflowCloneDrawer {...props} />;
}

function WorkflowCloneDrawer({
  open,
  inline = false,
  onClose,
  saving,
  title = 'Create workflow',
  submitLabel = 'Create draft',
  initialValues = EMPTY_VALUES,
  showStarterJourney = false,
  closeOnSave = true,
  fetchInquiryForms = noFormOptions,
  fetchRegistrationForms = noFormOptions,
  onSave,
}: Props) {
  const discard = useBoolean();
  const previewOpen = useBoolean(false);
  const descriptionOpen = useBoolean(false);
  const isMobile = useResponsive('down', 'sm');
  const { closing, closeAfterExit, onExited, reopen } = useStudentDrawerExit();
  const formik = useFormik<WorkflowDetails>({
    enableReinitialize: true,
    initialValues: { ...initialValues, description: initialValues.description ?? '' },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        const continueAfterClose = await onSave(normalizeWorkflowDetails(values));
        if (closeOnSave) {
          closeAfterExit(() => {
            helpers.resetForm();
            onClose();
            continueAfterClose?.();
          });
        }
      } catch (error) {
        showWorkflowNameError(error, helpers);
      }
    },
  });

  useEffect(() => {
    if (!open) reopen();
  }, [open, reopen]);

  const close = () => {
    discard.onFalse();
    closeAfterExit(() => {
      previewOpen.onFalse();
      descriptionOpen.onFalse();
      formik.resetForm();
      onClose();
    });
  };
  const requestClose = () => {
    if (saving || formik.isSubmitting || closing) return;
    if (formik.dirty) discard.onTrue();
    else close();
  };

  const selectedTemplate =
    getWorkflowStarterDefinition(formik.values.starterJourney) ??
    getWorkflowStarterDefinition('standard')!;

  const content = (
    <>
      {open && <WorkflowDetailsDirtyState dirty={formik.dirty} busy={saving} />}
      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-start"
        sx={inline ? { position: 'absolute', top: 8, right: 8, zIndex: 1 } : { px: 2, py: 1.5 }}
      >
        {!inline && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography
                id="admission-workflow-drawer-title"
                variant={inline ? 'subtitle1' : 'h6'}
                component={inline ? 'h2' : 'div'}
              >
                {title}
              </Typography>
              <CustomTooltip
                title={
                  inline
                    ? 'Edit this draft’s name and description. Configure templates, stages, and routes in Build Journey.'
                    : 'Create an editable workflow draft, then configure its admission stages and next steps.'
                }
                arrow
                placement={isMobile ? 'bottom' : 'right'}
              >
                <IconButton size="small" color="info" aria-label="Workflow Information">
                  <Iconify icon="mdi:information-outline" width={18} />
                </IconButton>
              </CustomTooltip>
            </Stack>
          </Box>
        )}
        {showStarterJourney && !descriptionOpen.value && !formik.values.description && (
          <CustomTooltip title="Add an optional workflow description">
            <IconButton
              size="small"
              aria-label="Add workflow description"
              onClick={descriptionOpen.onTrue}
              sx={{ width: { xs: 44, sm: 36 }, height: { xs: 44, sm: 36 } }}
            >
              <Iconify icon="mdi:text-box-plus-outline" />
            </IconButton>
          </CustomTooltip>
        )}
        <IconButton
          size="small"
          aria-label="Close Workflow Editor"
          onClick={requestClose}
          disabled={saving}
          sx={{ width: { xs: 44, sm: 36 }, height: { xs: 44, sm: 36 } }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      {!inline && <Divider />}
      {inline && <WorkflowSetupProgress activeStep={0} />}
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          bgcolor: inline ? 'background.paper' : 'background.neutral',
          p: { xs: 1.5, sm: 2 },
        }}
      >
        <Stack spacing={2}>
          <FormSectionCard
            icon="mdi:clipboard-text-outline"
            title="Workflow Details"
            descriptionTooltip="Name this independent workflow draft and add an optional description. The source version and existing applications keep their saved workflow."
          >
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: 'minmax(0, 1fr)',
              }}
            >
              <WorkflowNameField formik={formik} autoFocus={!isMobile} />
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
                  label="Description"
                  placeholder="Explain when the school should use this journey."
                  {...formik.getFieldProps('description')}
                  error={Boolean(formik.touched.description && formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </ShakingTextField>
            )}
            {showStarterJourney && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">Published Forms</Typography>
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
                      label="Inquiry form"
                      valueId={formik.values.defaultInquiryFormDefinitionId ?? null}
                      fetchOptions={fetchInquiryForms}
                      onChange={(id) => formik.setFieldValue('defaultInquiryFormDefinitionId', id)}
                      noOptionsText="No published inquiry forms found"
                    />
                  </Box>
                </Stack>
              </>
            )}
          </FormSectionCard>
          {showStarterJourney && (
            <FormSectionCard
              icon="mdi:sitemap-outline"
              title="Choose a Workflow Template"
              descriptionTooltip="Choose the initial stages and routes for this draft. Review the journey preview before continuing."
              titleTypographyProps={{
                sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
              }}
            >
              <Stack spacing={1.5}>
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
                        <Typography variant="subtitle2">Preview Journey</Typography>
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
            </FormSectionCard>
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
          startIcon={<Iconify icon={inline ? 'mdi:content-save-outline' : 'mdi:plus'} />}
          onClick={() => formik.handleSubmit()}
        >
          {submitLabel}
        </LoadingButton>
      </DialogActions>
    </>
  );

  return (
    <>
      {inline ? (
        open && (
          <Card
            component="section"
            aria-label={title}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {content}
          </Card>
        )
      ) : (
        <Drawer
          anchor="right"
          open={open && !closing}
          onClose={requestClose}
          onTransitionExited={onExited}
          PaperProps={{
            inert: closing,
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
          {content}
        </Drawer>
      )}
      {discard.value && renderUnsavedConfirmation(discard.onFalse, close, { busy: saving })}
    </>
  );
}
