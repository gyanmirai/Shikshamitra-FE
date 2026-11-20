import type { FormikProps } from 'formik';

import { Grid, Alert, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { CatalogueCodeField } from './CatalogueCodeField';
import { useBookEditorOptions } from './useBookEditorOptions';

import type { BookFormValues } from '../Components/type';

export function BookClassificationFields({
  formik,
  disabled,
}: {
  formik: FormikProps<BookFormValues>;
  disabled: boolean;
}) {
  const query = useBookEditorOptions();
  const configuration = query.currentData?.catalogueConfiguration;
  const categories = query.currentData?.bookCategories || [];
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
  if (!query.currentData && formik.values.categoryId)
    categoryOptions.push({
      value: formik.values.categoryId,
      label: `Selected category ID: ${formik.values.categoryId}`,
    });
  const choices = [
    {
      name: 'categoryId',
      label: 'Category',
      required: true,
      options: categoryOptions,
    },
    {
      name: 'applicableAge',
      label: 'Applicable age',
      required: configuration?.requiredFields.includes('applicableAge') ?? false,
      options: [
        { value: '6-8', label: '6–8 years' },
        { value: '9-12', label: '9–12 years' },
        { value: '13-15', label: '13–15 years' },
        { value: '15plus', label: '15+ years' },
      ],
    },
  ] as const;
  return (
    <Grid container spacing={2}>
      {!query.canRead && (
        <Grid size={12}>
          <Alert severity="info">
            Catalogue view and add or update permission are required to load editor choices.
          </Alert>
        </Grid>
      )}
      {!query.academicYearId && (
        <Grid size={12}>
          <Alert severity="info">Select an academic year to load book categories.</Alert>
        </Grid>
      )}
      {query.currentData && !categories.length && (
        <Grid size={12}>
          <Alert severity="info">No book categories are configured for this school.</Alert>
        </Grid>
      )}
      {query.isError && (
        <Grid size={{ xs: 12 }}>
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Could not load book categories.
          </Alert>
        </Grid>
      )}
      {choices.map(({ name, label, required, options }) => {
        const error = Boolean(formik.touched[name] && formik.errors[name]);
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={name}>
            <ShakingTextField error={error}>
              <CustomSelect
                name={name}
                label={label}
                required={required}
                value={formik.values[name] ?? ''}
                options={[...options]}
                disabled={
                  disabled ||
                  (name === 'categoryId' &&
                    (query.isFetching || !query.currentData || !query.canRead))
                }
                isLoading={name === 'categoryId' && query.isFetching}
                onChange={(value) => formik.setFieldValue(name, value)}
                onBlur={() => formik.setFieldTouched(name, true)}
                error={error}
                helperText={error ? String(formik.errors[name]) : undefined}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>
        );
      })}
      {(['languageCode', 'materialCode'] as const).map((field) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={field}>
          <CatalogueCodeField
            formik={formik}
            field={field}
            choices={
              (field === 'languageCode' ? configuration?.languages : configuration?.materials) || []
            }
            required={
              configuration?.requiredFields.includes(
                field === 'languageCode' ? 'language' : 'material'
              ) ?? false
            }
            disabled={disabled || !configuration}
          />
        </Grid>
      ))}
    </Grid>
  );
}
