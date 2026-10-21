import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import TextField from '@mui/material/TextField';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { documentCategories } from '../types';

import type { DocumentFormValues } from '../types';

export function DocumentDetailsFields({ formik }: { formik: FormikProps<DocumentFormValues> }) {
  const nameError = Boolean(formik.touched.name && formik.errors.name);
  const categoryError = Boolean(formik.touched.category && formik.errors.category);
  return (
    <FormSectionCard
      title="Document Details"
      icon={GlobalIcons.doc}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      descriptionTooltip="Name and categorize the approval, permission or other school document."
    >
      <ShakingTextField error={nameError}>
        <TextField
          fullWidth
          required
          size="small"
          autoFocus
          label="Document name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={nameError}
          helperText={formik.touched.name && formik.errors.name}
          slotProps={{ htmlInput: { maxLength: 200 } }}
        />
      </ShakingTextField>
      <ShakingTextField error={categoryError}>
        <CustomSelect
          required
          fullWidth
          label="Category"
          name="category"
          value={formik.values.category}
          options={documentCategories}
          onChange={(value) => {
            formik.setFieldValue('category', Number(value));
          }}
          onBlur={() => {
            formik.setFieldTouched('category', true);
          }}
          error={categoryError}
          helperText={formik.touched.category ? formik.errors.category : undefined}
        />
      </ShakingTextField>
      <TextField
        fullWidth
        size="small"
        multiline
        minRows={2}
        label="Notes"
        name="notes"
        value={formik.values.notes}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(formik.touched.notes && formik.errors.notes)}
        helperText={formik.touched.notes && formik.errors.notes}
        slotProps={{ htmlInput: { maxLength: 2000 } }}
      />
    </FormSectionCard>
  );
}
