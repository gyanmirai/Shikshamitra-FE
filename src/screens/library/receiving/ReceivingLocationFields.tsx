import type { ReceivingOptions } from 'src/redux/library/receiving-types';

import { Grid } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { receivingFieldError } from './receiving-field-state';

import type { ReceivingForm } from './receiving-field-state';

export function ReceivingLocationFields({
  formik,
  index,
  options,
  disabled,
}: {
  formik: ReceivingForm;
  index: number;
  options?: ReceivingOptions;
  disabled: boolean;
}) {
  const line = formik.values.lines[index];
  const prefix = `lines[${index}]`;
  const sections = options?.sections || [];
  const shelves = sections.find((section) => section.id === line.sectionId)?.shelfDetails || [];
  const field = (name: 'sectionId' | 'shelfId') => ({
    name: `${prefix}.${name}`,
    required: true,
    fullWidth: true,
    size: 'small' as const,
    value: line[name],
    onBlur: () => formik.setFieldTouched(`${prefix}.${name}`, true),
    error: Boolean(receivingFieldError(formik, `${prefix}.${name}`)),
    helperText: receivingFieldError(formik, `${prefix}.${name}`),
  });
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={field('sectionId').error}>
          <CustomSelect
            {...field('sectionId')}
            label="Section"
            isSearch
            options={sections}
            labelKey="sectionName"
            valueKey="id"
            disabled={disabled || !options}
            onChange={(value) => {
              formik.setFieldValue(`${prefix}.sectionId`, String(value));
              formik.setFieldValue(`${prefix}.shelfId`, '');
            }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={field('shelfId').error}>
          <CustomSelect
            {...field('shelfId')}
            label="Shelf"
            isSearch
            options={shelves}
            labelKey="shelfName"
            valueKey="id"
            disabled={disabled || !line.sectionId || !options}
            onChange={(value) => formik.setFieldValue(`${prefix}.shelfId`, String(value))}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}
