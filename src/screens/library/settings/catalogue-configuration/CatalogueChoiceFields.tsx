import type { FormikProps } from 'formik';
import type { CatalogueDefinition } from 'src/redux/library/catalogue-configuration-types';

import { getIn } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, Switch, TextField, IconButton, FormControlLabel } from '@mui/material';

export function CatalogueChoiceFields({
  formik,
  field,
  index,
  saved,
  disabled,
}: {
  formik: FormikProps<CatalogueDefinition>;
  field: 'languages' | 'materials';
  index: number;
  saved: boolean;
  disabled: boolean;
}) {
  const item = formik.values[field][index];
  const kind = field === 'languages' ? 'Language' : 'Material';
  return (
    <Grid container spacing={2} alignItems="center">
      {(['code', 'label'] as const).map((name) => {
        const path = `${field}.${index}.${name}`;
        const error = Boolean(getIn(formik.touched, path) && getIn(formik.errors, path));
        return (
          <Grid key={name} size={{ xs: 12, sm: name === 'code' ? 3 : 5 }}>
            <ShakingTextField error={error}>
              <TextField
                name={path}
                label={
                  name === 'code' ? `${kind} code` : `${kind} label (${item.code || index + 1})`
                }
                required
                fullWidth
                size="small"
                value={item[name]}
                disabled={disabled || (name === 'code' && saved)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={error}
                helperText={
                  error
                    ? String(getIn(formik.errors, path))
                    : name === 'code' && saved
                      ? 'Saved codes are permanent.'
                      : undefined
                }
              />
            </ShakingTextField>
          </Grid>
        );
      })}
      <Grid size={{ xs: 10, sm: 3 }}>
        <FormControlLabel
          label={item.isActive ? 'Active' : 'Retired'}
          control={
            <Switch
              size="small"
              disabled={disabled}
              checked={item.isActive}
              slotProps={{ input: { 'aria-label': `${kind} ${item.code || index + 1} is active` } }}
              onChange={(_, checked) => formik.setFieldValue(`${field}.${index}.isActive`, checked)}
            />
          }
        />
      </Grid>
      {!saved && (
        <Grid size={{ xs: 2, sm: 1 }}>
          <IconButton
            size="small"
            disabled={disabled}
            aria-label={`Remove new ${kind.toLowerCase()} ${item.code || index + 1}`}
            onClick={() =>
              formik.setFieldValue(
                field,
                formik.values[field].filter((_, row) => row !== index)
              )
            }
          >
            <Iconify icon={GlobalIcons.delete} />
          </IconButton>
        </Grid>
      )}
    </Grid>
  );
}
