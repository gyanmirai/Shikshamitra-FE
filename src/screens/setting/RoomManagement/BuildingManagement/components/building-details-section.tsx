import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import { Stack, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useInstituteFieldPreview } from 'src/components/institute-field-formatting/use-institute-field-preview';

import type { IBuildingFormValues } from '../types';

export function BuildingDetailsSection({
  formik,
  isEditing = false,
}: {
  formik: FormikProps<IBuildingFormValues>;
  isEditing?: boolean;
}) {
  const namePreview = useInstituteFieldPreview(
    'buildings',
    'buildingName',
    formik.values.buildingName,
    isEditing
  );
  const descriptionPreview = useInstituteFieldPreview(
    'buildings',
    'description',
    formik.values.description,
    isEditing
  );
  const nameError = Boolean(
    (formik.touched.buildingName || formik.submitCount > 0) && formik.errors.buildingName
  );
  const descriptionError = Boolean(
    (formik.touched.description || formik.submitCount > 0) && formik.errors.description
  );
  return (
    <FormSectionCard
      icon={GlobalIcons.building}
      title="Building Details"
      descriptionTooltip="Name the building and add an optional description."
    >
      <Stack spacing={2}>
        <ShakingTextField error={nameError}>
          <TextField
            required
            fullWidth
            size="small"
            id="building-name"
            label="Building name"
            name="buildingName"
            value={formik.values.buildingName}
            onChange={(event) =>
              formik.setFieldValue(
                'buildingName',
                event.target.value.replace(/[^a-zA-Z0-9\s]/g, '')
              )
            }
            onBlur={formik.handleBlur}
            error={nameError}
            helperText={nameError ? formik.errors.buildingName : namePreview}
          />
        </ShakingTextField>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          id="building-description"
          label="Description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={descriptionError}
          helperText={
            descriptionError
              ? formik.errors.description
              : descriptionPreview || `${formik.values.description.length}/500 characters`
          }
        />
      </Stack>
    </FormSectionCard>
  );
}
