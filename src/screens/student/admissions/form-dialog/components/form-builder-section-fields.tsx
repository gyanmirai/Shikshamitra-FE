import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderField } from '../form-builder-field';
import { newField, nextFieldOrder } from '../form-dialog-model';

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
  const addField = () => {
    const field = newField(section.id, nextFieldOrder(formik.values.sections));
    formik.setFieldValue(`sections[${sectionIndex}].fields`, [...section.fields, field]);
    onSelectField(field.id);
  };
  return (
    <Stack spacing={1} sx={{ p: 1 }}>
      <SortableContext
        items={section.fields.map((field) => `field:${section.id}:${field.id}`)}
        strategy={verticalListSortingStrategy}
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
            Choose a student field from Add fields, or create your own below.
          </Typography>
        </Stack>
      )}
      <Button
        size="small"
        color="inherit"
        startIcon={<Iconify icon="mdi:plus" />}
        onClick={addField}
        sx={{ minHeight: 44, alignSelf: 'flex-start' }}
      >
        Add custom field
      </Button>
    </Stack>
  );
}
