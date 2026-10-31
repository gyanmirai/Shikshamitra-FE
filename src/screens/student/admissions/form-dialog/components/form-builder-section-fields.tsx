import type { FormikProps } from 'formik';
import type {
  AdmissionFormSection,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderField } from '../form-builder-field';
import { isLockedInquiryField } from '../inquiry-default-fields';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  displaySection?: AdmissionFormSection;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
};

export function FormBuilderSectionFields({
  formik,
  sectionIndex,
  displaySection,
  selectedFieldId,
  onSelectField,
}: Props) {
  const section = displaySection ?? formik.values.sections[sectionIndex];
  const columns = section.fieldsPerRow ?? formik.values.fieldsPerRow;
  const displayFormik = displaySection
    ? {
        ...formik,
        values: {
          ...formik.values,
          fieldsPerRow: columns,
          sections: formik.values.sections.map((item, index) =>
            index === sectionIndex ? section : item
          ),
        },
      }
    : formik;
  const removeField = (fieldId: string) => {
    const field = formik.values.sections[sectionIndex].fields.find((item) => item.id === fieldId);
    if (!field || field.inheritedFrom || isLockedInquiryField(formik.values.purpose, field)) return;
    formik.setFieldValue(
      `sections[${sectionIndex}].fields`,
      formik.values.sections[sectionIndex].fields.filter((item) => item.id !== fieldId)
    );
  };
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
              sm: `repeat(${Math.min(columns, 2)}, minmax(0, 1fr))`,
              lg: `repeat(${columns}, minmax(0, 1fr))`,
            },
          }}
        >
          {section.fields.map((field, fieldIndex) => (
            <FormBuilderField
              key={field.id}
              formik={displayFormik}
              sectionIndex={sectionIndex}
              fieldIndex={fieldIndex}
              selected={selectedFieldId === field.id}
              onSelect={() => onSelectField(field.id)}
              onDelete={() => removeField(field.id)}
              reorderEnabled={!field.inheritedFrom}
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
