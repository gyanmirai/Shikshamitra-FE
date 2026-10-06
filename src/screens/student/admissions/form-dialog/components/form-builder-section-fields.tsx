import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderField } from '../form-builder-field';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
};

export function FormBuilderSectionFields({
  formik,
  sectionIndex,
  selectedFieldId,
  onSelectField,
}: Props) {
  const section = formik.values.sections[sectionIndex];
  const removeField = (fieldIndex: number) =>
    formik.setFieldValue(
      `sections[${sectionIndex}].fields`,
      section.fields.filter((_, index) => index !== fieldIndex)
    );
  return (
    <Stack spacing={1} sx={{ px: 2, pb: 2 }}>
      <SortableContext
        items={section.fields.map((field) => `field:${section.id}:${field.id}`)}
        strategy={rectSortingStrategy}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              sm: `repeat(${Math.min(formik.values.fieldsPerRow, 2)}, minmax(0, 1fr))`,
              lg: `repeat(${formik.values.fieldsPerRow}, minmax(0, 1fr))`,
            },
          }}
        >
          {section.fields.map((field, fieldIndex) => (
            <FormBuilderField
              key={field.id}
              formik={formik}
              sectionIndex={sectionIndex}
              fieldIndex={fieldIndex}
              selected={selectedFieldId === field.id}
              onSelect={() => onSelectField(field.id)}
              onDelete={() => removeField(fieldIndex)}
            />
          ))}
        </Box>
      </SortableContext>
      {!section.fields.length && (
        <Stack
          alignItems="center"
          spacing={0.5}
          sx={{
            py: 2,
            px: 1,
            textAlign: 'center',
            border: 1,
            borderStyle: 'dashed',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Iconify icon="mdi:form-textbox" width={28} sx={{ mb: 0.5, color: 'text.disabled' }} />
          <Typography variant="subtitle2">Add your first field</Typography>
          <Typography variant="caption" color="text.secondary">
            Select this section heading, then choose Student fields or Custom fields from Add
            fields.
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
