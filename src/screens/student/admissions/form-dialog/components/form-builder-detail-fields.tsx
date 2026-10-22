import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, MenuItem, TextField, Autocomplete } from '@mui/material';

import { ADMISSION_FORM_LANGUAGES, AVAILABLE_ADMISSION_FORM_LANGUAGES } from '../form-languages';

export function FormBuilderDetailFields({
  formik,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
}) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
          <TextField
            fullWidth
            size="small"
            label="Form name *"
            {...formik.getFieldProps('name')}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Form layout *"
          value={formik.values.layoutType}
          onChange={(event) => formik.setFieldValue('layoutType', Number(event.target.value))}
        >
          <MenuItem value={0}>Single page</MenuItem>
          <MenuItem value={1}>Step by step</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          size="small"
          label="Description (optional)"
          multiline
          minRows={1}
          {...formik.getFieldProps('description')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Autocomplete
          multiple
          disableCloseOnSelect
          slotProps={{
            chip: {
              size: 'small',
              color: 'default',
              sx: { bgcolor: 'action.selected', color: 'text.primary' },
            },
          }}
          options={AVAILABLE_ADMISSION_FORM_LANGUAGES}
          value={ADMISSION_FORM_LANGUAGES.filter((option) =>
            formik.values.supportedLanguages.includes(option.value)
          )}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(_, options) => {
            const languages: string[] = options.map((option) => option.value);
            formik.setFieldValue('supportedLanguages', languages);
            if (!languages.map(String).includes(formik.values.defaultLanguage)) {
              formik.setFieldValue('defaultLanguage', languages[0] ?? 'en');
            }
          }}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Applicant languages *" />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Default language *"
          value={formik.values.defaultLanguage}
          onChange={(event) => formik.setFieldValue('defaultLanguage', event.target.value)}
        >
          {ADMISSION_FORM_LANGUAGES.filter((option) =>
            formik.values.supportedLanguages.includes(option.value)
          ).map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  );
}
