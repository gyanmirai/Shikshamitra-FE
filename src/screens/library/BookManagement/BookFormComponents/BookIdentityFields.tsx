import type { FormikProps } from 'formik';

import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { BookTitleLookup } from './BookTitleLookup';
import { useBookEditorOptions } from './useBookEditorOptions';

import type { BookFormValues } from '../Components/type';

const fields = [
  { name: 'author', label: 'Author', required: true },
  { name: 'isbn', label: 'ISBN', required: false },
  { name: 'publisher', label: 'Publisher', required: false },
  { name: 'subject', label: 'Subject', required: false },
  { name: 'edition', label: 'Edition', required: false },
] as const;

export function BookIdentityFields({
  formik,
  disabled,
}: {
  formik: FormikProps<BookFormValues>;
  disabled: boolean;
}) {
  const query = useBookEditorOptions();
  const configuration = query.currentData?.catalogueConfiguration;
  const locked = disabled || !configuration;
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <BookTitleLookup formik={formik} disabled={locked} />
      </Grid>
      {fields.map(({ name, label }) => {
        const error = Boolean(formik.touched[name] && formik.errors[name]);
        const required = configuration?.requiredFields.includes(name) ?? name === 'author';
        return (
          <Grid key={name} size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={error}>
              <TextField
                name={name}
                label={label}
                required={required}
                fullWidth
                size="small"
                disabled={locked}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={error}
                helperText={
                  error
                    ? formik.errors[name]
                    : name === 'isbn' && !required
                      ? 'Optional for books without an ISBN.'
                      : undefined
                }
              />
            </ShakingTextField>
          </Grid>
        );
      })}
    </Grid>
  );
}
