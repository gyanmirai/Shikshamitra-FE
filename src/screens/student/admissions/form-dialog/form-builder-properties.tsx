import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Chip, Stack, Typography } from '@mui/material';

import { FIELD_TYPES } from './form-dialog-model';
import { FormFieldCoreFields } from './form-field-core-fields';
import { FormFieldAdvancedFields } from './form-field-advanced-fields';
import { FormFieldLocationSettings } from './form-field-location-settings';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  selectedLocation: { sectionIndex: number; fieldIndex: number } | null;
};

export function FormBuilderProperties({ formik, selectedLocation }: Props) {
  if (!selectedLocation) {
    return (
      <Stack
        sx={{
          height: 1,
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Iconify icon="mdi:form-select" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
        <Typography variant="subtitle2">Select a field</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Choose a field in the canvas to edit its label, data source, behavior, and rules.
        </Typography>
      </Stack>
    );
  }

  const field =
    formik.values.sections[selectedLocation.sectionIndex].fields[selectedLocation.fieldIndex];
  const fieldType = FIELD_TYPES.find(([, value]) => value === field.fieldType)?.[0] ?? 'Field';
  return (
    <Stack sx={{ height: 1, minHeight: 0, bgcolor: 'background.paper' }}>
      <Box sx={{ p: 1.5, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1">Field settings</Typography>
        <Typography variant="caption" color="text.secondary">
          Changes apply to the selected field immediately.
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
          <Chip size="small" label={fieldType} variant="outlined" />
          <Chip
            size="small"
            label={field.bindingType === 0 ? 'Student field' : 'Custom field'}
            color={field.bindingType === 0 ? 'info' : 'default'}
          />
        </Stack>
      </Box>
      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={2} sx={{ p: 1.5 }}>
          <FormFieldCoreFields
            formik={formik}
            sectionIndex={selectedLocation.sectionIndex}
            fieldIndex={selectedLocation.fieldIndex}
          />
          <FormFieldLocationSettings
            formik={formik}
            sectionIndex={selectedLocation.sectionIndex}
            fieldIndex={selectedLocation.fieldIndex}
          />
          <FormFieldAdvancedFields
            formik={formik}
            sectionIndex={selectedLocation.sectionIndex}
            fieldIndex={selectedLocation.fieldIndex}
          />
        </Stack>
      </Scrollbar>
    </Stack>
  );
}
