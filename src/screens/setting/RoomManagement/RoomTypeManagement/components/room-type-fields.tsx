import { useFormikContext } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useInstituteFieldPreview } from 'src/components/institute-field-formatting/use-institute-field-preview';

import type { RoomTypeValues } from './use-room-type-form';

export function RoomTypeFields({ isEditing = false }: { isEditing?: boolean }) {
  const formik = useFormikContext<RoomTypeValues>();
  const namePreview = useInstituteFieldPreview(
    'roomTypes',
    'roomTypeName',
    formik.values.roomTypeName,
    isEditing
  );
  const shortNamePreview = useInstituteFieldPreview(
    'roomTypes',
    'shortName',
    formik.values.shortName,
    isEditing
  );
  const nameError = Boolean(
    (formik.touched.roomTypeName || formik.submitCount > 0) && formik.errors.roomTypeName
  );
  const shortNameError = Boolean(
    (formik.touched.shortName || formik.submitCount > 0) && formik.errors.shortName
  );
  return (
    <FormSectionCard
      title="Room Type Details"
      icon={GlobalIcons.notebook}
      descriptionTooltip="Name the room type and enter the short name used to identify it."
    >
      <Stack spacing={2}>
        <ShakingTextField error={nameError}>
          <TextField
            required
            fullWidth
            size="small"
            id="room-type-name"
            name="roomTypeName"
            label="Room type"
            value={formik.values.roomTypeName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={nameError}
            helperText={nameError ? formik.errors.roomTypeName : namePreview}
          />
        </ShakingTextField>
        <ShakingTextField error={shortNameError}>
          <TextField
            required
            fullWidth
            size="small"
            id="room-type-short-name"
            name="shortName"
            label="Short name"
            value={formik.values.shortName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={shortNameError}
            helperText={shortNameError ? formik.errors.shortName : shortNamePreview}
          />
        </ShakingTextField>
      </Stack>
    </FormSectionCard>
  );
}
