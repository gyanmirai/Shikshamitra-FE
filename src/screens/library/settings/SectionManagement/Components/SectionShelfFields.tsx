import { getIn } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Grid, Alert, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import type { useSectionDraft } from './useSectionDraft';

export function SectionShelfFields({ draft }: { draft: ReturnType<typeof useSectionDraft> }) {
  const { formik, busy } = draft;
  const groupError = typeof formik.errors.shelfNames === 'string' ? formik.errors.shelfNames : '';
  if (!formik.values.shelfNames.length) return null;
  return (
    <FormSectionCard
      title="Shelves"
      icon={GlobalIcons.assigned}
      descriptionTooltip="Enter one name per shelf. Names are required and must be unique within the section."
    >
      {groupError && formik.submitCount > 0 && <Alert severity="error">{groupError}</Alert>}
      <Grid container spacing={2}>
        {formik.values.shelfNames.map((value, index) => {
          const name = `shelfNames.${index}`;
          const message = Array.isArray(formik.errors.shelfNames)
            ? formik.errors.shelfNames[index]
            : undefined;
          const error = Boolean(
            (getIn(formik.touched, name) || formik.submitCount > 0) && (message || groupError)
          );
          return (
            <Grid key={name} size={{ xs: 12, sm: 6 }}>
              <ShakingTextField error={error}>
                <TextField
                  label={`Shelf ${index + 1} name`}
                  name={name}
                  value={value}
                  required
                  fullWidth
                  size="small"
                  disabled={busy}
                  error={error}
                  helperText={error ? message : undefined}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </ShakingTextField>
            </Grid>
          );
        })}
      </Grid>
    </FormSectionCard>
  );
}
