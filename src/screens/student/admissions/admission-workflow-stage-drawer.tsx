'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Drawer, Button, Divider, IconButton, Typography } from '@mui/material';

import { WorkflowStageFields } from './workflow-builder/components/workflow-stage-fields';

type Props = {
  open: boolean;
  stage: AdmissionWorkflowStage | null;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  readOnly: boolean;
  onClose: () => void;
  onSave: (stage: AdmissionWorkflowStage) => void;
};

const schema = Yup.object({
  name: Yup.string().trim().max(128).required('Stage name is required'),
  code: Yup.string()
    .trim()
    .uppercase()
    .matches(/^[A-Z][A-Z0-9_-]*$/, 'Use uppercase letters, numbers, hyphens, or underscores')
    .max(64)
    .required('Stage code is required'),
  description: Yup.string().trim().max(512),
});

const emptyStage: AdmissionWorkflowStage = {
  id: '', code: '', name: '', stageType: 11, displayOrder: 0,
  isRequired: true, allowManualSkip: false, isEntryStage: false, isTerminalStage: false,
};

export function AdmissionWorkflowStageDrawer({ open, stage, stageTypes, forms, readOnly, onClose, onSave }: Props) {
  const formik = useFormik<AdmissionWorkflowStage>({
    enableReinitialize: true,
    initialValues: stage ?? emptyStage,
    validationSchema: schema,
    validate: (values) => validateConfiguration(values, stageTypes),
    onSubmit: (values) => {
      onSave({
        ...values,
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        description: values.description?.trim() || undefined,
      });
      onClose();
    },
  });
  const metadata = stageTypes.find((item) => item.type === formik.values.stageType);
  const formDefinitionId = readFormDefinitionId(formik.values.configurationJson);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, sm: 480 }, maxWidth: 1 } }}>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Box>
            <Typography variant="h6">{readOnly ? 'Stage details' : 'Configure stage'}</Typography>
            <Typography variant="body2" color="text.secondary">Define behavior, not just display order.</Typography>
          </Box>
          <IconButton aria-label="Close stage editor" onClick={onClose}><Iconify icon="mdi:close" /></IconButton>
        </Stack>
        <Divider />
        <WorkflowStageFields formik={formik} metadata={metadata} stageTypes={stageTypes} forms={forms} formDefinitionId={formDefinitionId} readOnly={readOnly} />
        {!readOnly && <DrawerActions onCancel={onClose} />}
      </Box>
    </Drawer>
  );
}

function DrawerActions({ onCancel }: { onCancel: () => void }) {
  return <><Divider /><Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 2 }}><Button variant="outlined" size="small" startIcon={<Iconify icon="mdi:close" />} onClick={onCancel}>Cancel</Button><Button type="submit" variant="contained" size="small" startIcon={<Iconify icon="mdi:content-save-outline" />}>Save stage</Button></Stack></>;
}

function validateConfiguration(values: AdmissionWorkflowStage, stageTypes: AdmissionWorkflowStageTypeMetadata[]) {
  if (!stageTypes.find((item) => item.type === values.stageType)?.supportsFormAttachment) return {};
  return readFormDefinitionId(values.configurationJson)
    ? {}
    : { configurationJson: 'Select a published form version' };
}

function readFormDefinitionId(configurationJson?: string) {
  try {
    return configurationJson
      ? (JSON.parse(configurationJson) as { formDefinitionId?: string }).formDefinitionId ?? ''
      : '';
  } catch {
    return '';
  }
}
