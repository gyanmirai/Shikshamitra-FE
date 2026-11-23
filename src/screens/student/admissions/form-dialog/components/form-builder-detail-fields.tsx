import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, Button, MenuItem, TextField, Autocomplete } from '@mui/material';

import { getAdmissionFormStepGroups } from '../form-step-groups';
import { ADMISSION_FORM_LANGUAGES, AVAILABLE_ADMISSION_FORM_LANGUAGES } from '../form-languages';

export function FormBuilderDetailFields({
  formik,
  nameConflictMessage,
  checkingName,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  nameConflictMessage?: string | null;
  checkingName?: boolean;
}) {
  const [confirmSinglePage, setConfirmSinglePage] = useState(false);

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField
          error={Boolean(nameConflictMessage || (formik.touched.name && formik.errors.name))}
        >
          <TextField
            fullWidth
            size="small"
            label="Form Name *"
            {...formik.getFieldProps('name')}
            error={Boolean(nameConflictMessage || (formik.touched.name && formik.errors.name))}
            helperText={
              nameConflictMessage ||
              (formik.touched.name && formik.errors.name) ||
              (checkingName ? 'Checking name availability…' : undefined)
            }
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Form Layout *"
          value={formik.values.layoutType}
          onChange={(event) => {
            const layoutType = Number(event.target.value);
            const { purpose, layoutType: currentLayout, sections } = formik.values;
            if (
              purpose === 0 &&
              currentLayout === 1 &&
              layoutType === 0 &&
              getAdmissionFormStepGroups(sections).length > 1
            ) {
              setConfirmSinglePage(true);
              return;
            }
            formik.setFieldValue('layoutType', layoutType);
          }}
        >
          <MenuItem value={0}>Single Page</MenuItem>
          <MenuItem value={1}>Step by Step</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          size="small"
          label="Description"
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
              variant: 'soft',
              sx: {
                bgcolor: 'action.selected',
                color: 'text.primary',
                border: 1,
                borderColor: 'divider',
                '& .MuiChip-deleteIcon': {
                  color: 'text.secondary',
                  opacity: 1,
                  '&:hover': { color: 'text.primary' },
                },
              },
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
            <TextField {...params} size="small" label="Applicant Languages *" />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Default Language *"
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
      <ConfirmDialog
        open={confirmSinglePage}
        icon="info"
        title="Switch to Single Page?"
        content="Sections will appear on one page. Your fields and visibility rules will be kept, and the original step groups will be available if you switch back."
        onClose={() => setConfirmSinglePage(false)}
        action={
          <Button
            type="button"
            size="small"
            color="inherit"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.transfer} />}
            onClick={() => {
              formik.setFieldValue('layoutType', 0);
              setConfirmSinglePage(false);
            }}
          >
            Switch to single page
          </Button>
        }
      />
    </Grid>
  );
}
