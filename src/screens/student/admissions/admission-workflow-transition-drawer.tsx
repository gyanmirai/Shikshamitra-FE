'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useFormik } from 'formik';
import { useId, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { Box, Stack, Drawer, Button, Divider, IconButton, Typography } from '@mui/material';
import { useStudentDrawerExit } from 'src/screens/student/components/use-student-drawer-exit';

import { serializeSimpleCondition } from './workflow-builder-utils';
import { getRouteSaveError } from './workflow-builder/workflow-route-diagnostics';
import { isApplicationStageType } from './workflow-builder/workflow-stage-configuration';
import { WorkflowTransitionFields } from './workflow-builder/components/workflow-transition-fields';
import { SavedWorkflowTransitionDetails } from './workflow-builder/components/saved-workflow-transition-details';
import {
  isValidRouteNumber,
  getRouteConditionFields,
} from './workflow-builder/workflow-condition-catalog';
import {
  workflowTransitionSchema,
  getTransitionConditionEditorState,
  type WorkflowTransitionFormValues,
} from './workflow-builder/workflow-transition-form';

type Props = {
  open: boolean;
  transition: AdmissionWorkflowTransition | null;
  stages: AdmissionWorkflowStage[];
  transitions?: AdmissionWorkflowTransition[];
  forms?: AdmissionForm[];
  formsLoading?: boolean;
  formsError?: boolean;
  onRetryForms?: () => void;
  readOnly: boolean;
  simpleNextStep?: boolean;
  onClose: () => void;
  onSave: (transition: AdmissionWorkflowTransition) => void;
};

export function AdmissionWorkflowTransitionDrawer({
  open,
  transition,
  stages,
  transitions = [],
  forms = [],
  formsLoading,
  formsError,
  onRetryForms,
  readOnly,
  simpleNextStep = false,
  onClose,
  onSave,
}: Props) {
  const titleId = useId();
  const discard = useBoolean();
  const { closing, closeAfterExit, onExited, reopen } = useStudentDrawerExit();
  const conditionState = getTransitionConditionEditorState(transition?.conditionRuleJson);
  const creatingConditionalPath = transition?.id === '' && transition.isDefault === false;
  const locked =
    readOnly ||
    (simpleNextStep && (conditionState.hasCondition || transition?.isDefault === false));
  const defaultFromStageId = transition?.fromStageId ?? stages[0]?.id ?? '';
  const conditionFields = getRouteConditionFields(forms, stages, transitions, defaultFromStageId);
  const nextPriority =
    Math.max(
      -1,
      ...transitions
        .filter((item) => item.fromStageId === defaultFromStageId)
        .map((item) => item.priority)
    ) + 1;
  const formik = useFormik<WorkflowTransitionFormValues>({
    enableReinitialize: true,
    initialValues: {
      id: transition?.id ?? '',
      fromStageId: defaultFromStageId,
      toStageId: transition?.toStageId ?? stages[1]?.id ?? '',
      priority: transition?.priority ?? nextPriority,
      isDefault: creatingConditionalPath
        ? false
        : conditionState.hasCondition
          ? false
          : (transition?.isDefault ?? true),
      conditionRuleJson: transition?.conditionRuleJson,
      ...conditionState,
      ...(creatingConditionalPath ? { hasCondition: true } : {}),
    },
    validationSchema: workflowTransitionSchema,
    validate: (values) => {
      const errors: Partial<Record<keyof WorkflowTransitionFormValues, string>> = {};
      if (
        transitions.some(
          (item) =>
            item.id !== values.id &&
            item.fromStageId === values.fromStageId &&
            item.toStageId === values.toStageId
        )
      ) {
        errors.toStageId = 'A route between these stages already exists';
      }
      if (
        !values.hasCondition &&
        transitions.some(
          (item) =>
            item.id !== values.id && item.fromStageId === values.fromStageId && item.isDefault
        )
      ) {
        errors.toStageId = 'This stage already has a default route';
      }
      if (
        values.hasCondition &&
        transitions.some(
          (item) =>
            item.id !== values.id &&
            item.fromStageId === values.fromStageId &&
            !item.isDefault &&
            item.priority === Number(values.priority)
        )
      ) {
        errors.priority = 'Use a unique priority for each conditional route from this stage';
      }
      const field = conditionFields.find((item) => item.value === values.conditionField);
      if (
        values.hasCondition &&
        !values.preserveCondition &&
        field?.fieldType === 2 &&
        !isValidRouteNumber(values.conditionValue, values.conditionOperator)
      ) {
        errors.conditionValue = 'Enter a valid number for this field';
      }
      return errors;
    },
    onSubmit: (values, helpers) => {
      if (locked) {
        helpers.setSubmitting(false);
        return;
      }
      const condition = values.hasCondition
        ? {
            field: values.conditionField,
            operator: values.conditionOperator,
            value: values.conditionValue,
          }
        : null;
      const route: AdmissionWorkflowTransition = {
        id: values.id || crypto.randomUUID(),
        fromStageId: values.fromStageId,
        toStageId: values.toStageId,
        priority: Number(values.priority),
        isDefault: !values.hasCondition,
        conditionRuleJson: values.preserveCondition
          ? values.conditionRuleJson
          : serializeSimpleCondition(condition),
      };
      const routeError = getRouteSaveError(route, stages, transitions);
      if (routeError) {
        helpers.setStatus(routeError);
        helpers.setSubmitting(false);
        return;
      }
      onSave(route);
      closeAfterExit(() => {
        helpers.resetForm({ values });
        onClose();
      });
    },
  });

  useEffect(() => {
    if (!open || closing || !formik.dirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [open, closing, formik.dirty]);

  useEffect(() => {
    if (!open) reopen();
  }, [open, reopen]);

  const close = () => {
    discard.onFalse();
    closeAfterExit(() => {
      formik.resetForm();
      onClose();
    });
  };
  const requestClose = () => {
    if (closing || formik.isSubmitting) return;
    if (!locked && formik.dirty) discard.onTrue();
    else close();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open && !closing}
        onClose={requestClose}
        onTransitionExited={onExited}
        PaperProps={{
          'aria-labelledby': titleId,
          inert: closing,
          sx: { width: { xs: 1, sm: 480 }, maxWidth: 1 },
        }}
      >
        <Box
          component={locked ? 'div' : 'form'}
          onSubmit={locked ? undefined : formik.handleSubmit}
          sx={{ height: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography id={titleId} variant="h6" component="h2">
                  {locked
                    ? 'Next-step Details'
                    : simpleNextStep
                      ? 'Choose Next Step'
                      : 'What Happens Next?'}
                </Typography>
                <InfoTooltipIcon
                  label={`About ${locked ? 'Next-step Details' : simpleNextStep ? 'Choose Next Step' : 'What Happens Next?'}`}
                  title={
                    locked
                      ? 'Review the saved source, destination and conditions for this workflow version. Viewing does not change the applicant journey.'
                      : 'Choose the usual next step or add a condition for continuing to another stage.'
                  }
                />
              </Stack>
              {!locked && (
                <Typography variant="body2" color="text.secondary">
                  {simpleNextStep
                    ? 'Choose where the applicant continues after this stage.'
                    : 'Choose the usual next step or add a path for a specific outcome.'}
                </Typography>
              )}
            </Box>
            <IconButton
              aria-label="Close Next-Step Editor"
              onClick={requestClose}
              sx={{ width: 44, height: 44 }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider />
          {locked ? (
            <SavedWorkflowTransitionDetails
              transition={transition}
              stages={stages}
              conditionFields={conditionFields}
            />
          ) : (
            <WorkflowTransitionFields
              formik={formik}
              stages={stages}
              conditionFields={conditionFields}
              formsLoading={formsLoading}
              formsError={formsError}
              onRetryForms={onRetryForms}
              competingPaths={
                transitions.filter(
                  (item) =>
                    item.id !== formik.values.id &&
                    item.fromStageId === formik.values.fromStageId &&
                    !item.isDefault
                ).length
              }
              readOnly={locked}
              simpleNextStep={simpleNextStep}
              lockFromStage
            />
          )}
          {!locked && (
            <DrawerActions
              onCancel={requestClose}
              disabled={
                !stages.some(
                  (item) =>
                    item.id === formik.values.fromStageId && isApplicationStageType(item.stageType)
                ) ||
                !stages.some(
                  (item) =>
                    item.id === formik.values.toStageId && isApplicationStageType(item.stageType)
                )
              }
            />
          )}
        </Box>
      </Drawer>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard Unsaved Changes?"
        icon="warning"
        cancelText="Keep editing"
        content="Your unsaved next-step changes will be lost."
        action={
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={close}
            startIcon={<Iconify icon="mdi:delete-outline" />}
          >
            Discard changes
          </Button>
        }
      />
    </>
  );
}

function DrawerActions({ onCancel, disabled }: { onCancel: () => void; disabled: boolean }) {
  return (
    <>
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={1}
        sx={{ px: { xs: 2, sm: 3 }, py: 1.75, flexShrink: 0 }}
      >
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={disabled}
          variant="contained"
          color="inherit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
        >
          Save path
        </Button>
      </Stack>
    </>
  );
}
