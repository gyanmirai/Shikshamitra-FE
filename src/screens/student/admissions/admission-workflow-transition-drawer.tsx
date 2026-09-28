'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useEffect } from 'react';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Drawer, Button, Divider, IconButton, Typography } from '@mui/material';

import { serializeSimpleCondition } from './workflow-builder-utils';
import { getRouteSaveError } from './workflow-builder/workflow-route-diagnostics';
import { WorkflowTransitionFields } from './workflow-builder/components/workflow-transition-fields';
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
  onClose,
  onSave,
}: Props) {
  const discard = useBoolean();
  const conditionState = getTransitionConditionEditorState(transition?.conditionRuleJson);
  const creatingConditionalPath = transition?.id === '' && transition.isDefault === false;
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
      helpers.resetForm({ values });
      onClose();
    },
  });

  useEffect(() => {
    if (!open || !formik.dirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [open, formik.dirty]);

  const close = () => {
    discard.onFalse();
    formik.resetForm();
    onClose();
  };
  const requestClose = () => {
    if (!readOnly && formik.dirty) discard.onTrue();
    else close();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={requestClose}
        PaperProps={{ sx: { width: { xs: 1, sm: 480 }, maxWidth: 1 } }}
      >
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ height: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
            <Box>
              <Typography variant="h6">
                {readOnly ? 'Next-step details' : 'What happens next?'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose the usual next step or add a path for a specific outcome.
              </Typography>
            </Box>
            <IconButton
              aria-label="Close next-step editor"
              onClick={requestClose}
              sx={{ width: 44, height: 44 }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider />
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
            readOnly={readOnly}
            lockFromStage
          />
          {!readOnly && <DrawerActions onCancel={requestClose} />}
        </Box>
      </Drawer>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard next-step changes?"
        content="Your unsaved next-step changes will be lost."
        action={
          <Button color="error" variant="contained" onClick={close}>
            Discard changes
          </Button>
        }
      />
    </>
  );
}

function DrawerActions({ onCancel }: { onCancel: () => void }) {
  return (
    <>
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{ p: 2, '& .MuiButton-root': { minHeight: 44 } }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:content-save-outline" />}
        >
          Save path
        </Button>
      </Stack>
    </>
  );
}
