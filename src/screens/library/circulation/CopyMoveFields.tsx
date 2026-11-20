import type { FormikProps } from 'formik';
import type { LibraryCopyMoveOptions } from 'src/redux/library/copy-lifecycle-types';

import { Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { CopyActionReason } from './CopyActionReason';

export type CopyMoveValues = { sectionId: string; shelfId: string; reason: string };
export function CopyMoveFields({
  formik,
  options,
  disabled,
}: {
  formik: FormikProps<CopyMoveValues>;
  options?: LibraryCopyMoveOptions;
  disabled: boolean;
}) {
  const sections = options?.sections || [];
  const shelves =
    sections.find((section) => section.id === formik.values.sectionId)?.shelfDetails || [];
  return (
    <Stack spacing={2}>
      {(['sectionId', 'shelfId'] as const).map((field) => {
        const error = formik.touched[field] ? formik.errors[field] : undefined;
        const values =
          field === 'sectionId'
            ? sections.map((row) => ({ id: row.id, name: row.sectionName }))
            : shelves.map((row) => ({ id: row.id, name: row.shelfName }));
        return (
          <ShakingTextField key={field} error={Boolean(error)}>
            <CustomSelect
              name={field}
              label={field === 'sectionId' ? 'Destination section' : 'Destination shelf'}
              required
              fullWidth
              size="small"
              value={
                values.some((option) => option.id === formik.values[field])
                  ? formik.values[field]
                  : ''
              }
              options={values}
              valueKey="id"
              labelKey="name"
              disabled={disabled || (field === 'shelfId' && !formik.values.sectionId)}
              onChange={(value) => {
                formik.setFieldValue(field, value);
                if (field === 'sectionId') formik.setFieldValue('shelfId', '');
              }}
              onBlur={() => formik.setFieldTouched(field, true)}
              error={Boolean(error)}
              helperText={error}
            />
          </ShakingTextField>
        );
      })}
      <CopyActionReason
        value={formik.values.reason}
        error={formik.touched.reason ? formik.errors.reason : undefined}
        disabled={disabled}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
    </Stack>
  );
}
