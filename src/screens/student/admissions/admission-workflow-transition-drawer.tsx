'use client';

import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Drawer, Button, Divider, IconButton, Typography } from '@mui/material';

import { parseSimpleCondition, serializeSimpleCondition } from './workflow-builder-utils';
import { WorkflowTransitionFields } from './workflow-builder/components/workflow-transition-fields';
import {
  workflowTransitionSchema,
  type WorkflowTransitionFormValues,
} from './workflow-builder/workflow-transition-form';

type Props = {
  open: boolean;
  transition: AdmissionWorkflowTransition | null;
  stages: AdmissionWorkflowStage[];
  readOnly: boolean;
  onClose: () => void;
  onSave: (transition: AdmissionWorkflowTransition) => void;
};

export function AdmissionWorkflowTransitionDrawer({ open, transition, stages, readOnly, onClose, onSave }: Props) {
  const parsedCondition = parseSimpleCondition(transition?.conditionRuleJson);
  const formik = useFormik<WorkflowTransitionFormValues>({
    enableReinitialize: true,
    initialValues: {
      id: transition?.id ?? '',
      fromStageId: transition?.fromStageId ?? stages[0]?.id ?? '',
      toStageId: transition?.toStageId ?? stages[1]?.id ?? '',
      priority: transition?.priority ?? 0,
      isDefault: transition?.isDefault ?? true,
      conditionRuleJson: transition?.conditionRuleJson,
      hasCondition: Boolean(parsedCondition),
      conditionField: parsedCondition?.field ?? '',
      conditionOperator: parsedCondition?.operator ?? 'Equals',
      conditionValue: parsedCondition?.value ?? '',
    },
    validationSchema: workflowTransitionSchema,
    onSubmit: (values) => {
      const condition = values.hasCondition
        ? { field: values.conditionField, operator: values.conditionOperator, value: values.conditionValue }
        : null;
      onSave({
        id: values.id || crypto.randomUUID(),
        fromStageId: values.fromStageId,
        toStageId: values.toStageId,
        priority: Number(values.priority),
        isDefault: values.hasCondition ? false : values.isDefault,
        conditionRuleJson: serializeSimpleCondition(condition),
      });
      onClose();
    },
  });

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, sm: 480 }, maxWidth: 1 } }}>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Box>
            <Typography variant="h6">{readOnly ? 'Transition details' : 'Configure transition'}</Typography>
            <Typography variant="body2" color="text.secondary">Connect stages with a default route or controlled condition.</Typography>
          </Box>
          <IconButton aria-label="Close transition editor" onClick={onClose}><Iconify icon="mdi:close" /></IconButton>
        </Stack>
        <Divider />
        <WorkflowTransitionFields formik={formik} stages={stages} readOnly={readOnly} />
        {!readOnly && <DrawerActions onCancel={onClose} />}
      </Box>
    </Drawer>
  );
}

function DrawerActions({ onCancel }: { onCancel: () => void }) {
  return <><Divider /><Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 2 }}><Button variant="outlined" size="small" startIcon={<Iconify icon="mdi:close" />} onClick={onCancel}>Cancel</Button><Button type="submit" variant="contained" size="small" startIcon={<Iconify icon="mdi:content-save-outline" />}>Save transition</Button></Stack></>;
}
