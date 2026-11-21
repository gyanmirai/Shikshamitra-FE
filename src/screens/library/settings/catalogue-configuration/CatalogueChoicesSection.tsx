import type { FormikProps } from 'formik';
import type { CatalogueDefinition } from 'src/redux/library/catalogue-configuration-types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Alert, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { CatalogueChoiceFields } from './CatalogueChoiceFields';

export function CatalogueChoicesSection({
  formik,
  previous,
  field,
  disabled,
}: {
  formik: FormikProps<CatalogueDefinition>;
  previous: CatalogueDefinition;
  field: 'languages' | 'materials';
  disabled: boolean;
}) {
  const items = formik.values[field];
  const title = field === 'languages' ? 'Languages' : 'Material Types';
  const label = field === 'languages' ? 'language' : 'material';
  return (
    <FormSectionCard
      title={title}
      icon={GlobalIcons.bookIcon}
      descriptionTooltip="Choices belong to this school. Codes remain permanent once saved. Retire choices to stop new selections while preserving existing records. Material types do not change borrowing policy automatically."
    >
      <Stack spacing={2}>
        {!items.length && (
          <Typography variant="body2">
            No {field === 'languages' ? 'languages' : 'material types'} are configured.
          </Typography>
        )}
        {items.map((item, index) => (
          <CatalogueChoiceFields
            key={index}
            formik={formik}
            field={field}
            index={index}
            saved={index < previous[field].length}
            disabled={disabled}
          />
        ))}
        {typeof formik.errors[field] === 'string' && (
          <Alert severity="error">{String(formik.errors[field])}</Alert>
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          disabled={disabled || items.length >= 200}
          onClick={() =>
            formik.setFieldValue(field, [...items, { code: '', label: '', isActive: true }])
          }
          sx={{ alignSelf: 'flex-start' }}
        >
          Add {label}
        </Button>
      </Stack>
    </FormSectionCard>
  );
}
