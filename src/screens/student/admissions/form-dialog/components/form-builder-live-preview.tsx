import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Alert, Stack, Typography } from '@mui/material';

import { FormPreviewContent } from '../../form-preview/form-preview-content';
import { buildDynamicAdmissionYupSchema } from '../../admission-form-validation';
import { getAdmissionFormPreviewInitialValues } from '../../form-preview/form-preview-model';
import {
  FORM_SIMULATOR_PERSONAS,
  type FormSimulatorPersona,
  buildAdmissionFormPersonaValues,
} from '../form-simulator-personas';

export function getLivePreviewForm(form: CreateUpdateAdmissionForm): AdmissionForm {
  return {
    ...form,
    concurrencyStamp: form.concurrencyStamp ?? undefined,
    id: 'builder-preview',
    version: 1,
    status: 0 as const,
    sectionCount: form.sections.length,
  };
}

export function FormBuilderLivePreview({ form }: { form: CreateUpdateAdmissionForm }) {
  const previewForm = useMemo(() => getLivePreviewForm(form), [form]);
  const initialValues = useMemo(
    () => getAdmissionFormPreviewInitialValues(previewForm),
    [previewForm]
  );
  const validationSchema = useMemo(
    () => buildDynamicAdmissionYupSchema(previewForm),
    [previewForm]
  );
  const formik = useFormik<Record<string, string>>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async () => undefined,
  });
  const [persona, setPersona] = useState<FormSimulatorPersona>('blank');
  const applyPersona = async (value: string | number | string[] | number[]) => {
    const nextPersona = String(Array.isArray(value) ? value[0] : value) as FormSimulatorPersona;
    setPersona(nextPersona);
    await formik.setValues(buildAdmissionFormPersonaValues(previewForm, nextPersona));
    formik.setTouched({});
  };

  return (
    <Box sx={{ height: 1, overflowY: 'auto', p: { xs: 1, sm: 2 } }}>
      <Stack spacing={1.5} sx={{ mb: 1.5 }}>
        <Alert severity="info">
          Applicant preview only. Try fields and conditional rules here; nothing is submitted.
        </Alert>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
          <Box sx={{ width: { xs: 1, sm: 260 } }}>
            <CustomSelect
              label="Test scenario"
              value={persona}
              options={FORM_SIMULATOR_PERSONAS.map((item) => ({ ...item }))}
              onChange={applyPersona}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Apply sample answers, then validate the preview to expose missing or conditional data.
          </Typography>
        </Stack>
      </Stack>
      <FormPreviewContent form={previewForm} formik={formik} resolvedOptions={{}} />
    </Box>
  );
}
