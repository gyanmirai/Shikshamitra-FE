import type { FormikProps } from 'formik';
import type { CatalogueDefinition } from 'src/redux/library/catalogue-configuration-types';

import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';
import { Grid, Checkbox, Typography, FormControlLabel } from '@mui/material';

import { catalogueFields } from './catalogue-configuration-form';

export function RequiredCatalogueFields({
  formik,
  disabled,
}: {
  formik: FormikProps<CatalogueDefinition>;
  disabled: boolean;
}) {
  return (
    <FormSectionCard
      title="Required Metadata"
      icon={GlobalIcons.documentIcon}
      descriptionTooltip="Choose descriptive fields required when a book is created or edited. Title, category and inventory identity rules remain mandatory. Existing records are retained; newly required missing values must be completed on metadata edit."
    >
      <Typography variant="body2" color="text.secondary">
        Existing books keep their data. Newly required missing values must be completed when their
        metadata is edited.
      </Typography>
      <Grid container spacing={1}>
        {catalogueFields.map(({ value, label }) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={value}>
            <FormControlLabel
              label={label}
              control={
                <Checkbox
                  size="small"
                  disabled={disabled}
                  checked={formik.values.requiredFields.includes(value)}
                  onChange={(_, checked) =>
                    formik.setFieldValue(
                      'requiredFields',
                      checked
                        ? [...formik.values.requiredFields, value]
                        : formik.values.requiredFields.filter((field) => field !== value)
                    )
                  }
                />
              }
            />
          </Grid>
        ))}
      </Grid>
    </FormSectionCard>
  );
}
