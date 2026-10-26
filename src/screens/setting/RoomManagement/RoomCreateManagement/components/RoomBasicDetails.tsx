import type { FormikProps } from 'formik';

import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useInstituteFieldPreview } from 'src/components/institute-field-formatting/use-institute-field-preview';

import type {
  FloorOption,
  RoomFormValues,
  BuildingOption,
  RoomTypeOption,
} from '../types/room-form';

interface Props {
  formik: FormikProps<RoomFormValues>;
  buildings: BuildingOption[];
  floors: FloorOption[];
  roomTypes: RoomTypeOption[];
  loading: boolean;
  isEditing?: boolean;
}

export function RoomBasicDetails({
  formik,
  buildings,
  floors,
  roomTypes,
  loading,
  isEditing = false,
}: Props) {
  const namePreview = useInstituteFieldPreview(
    'rooms',
    'roomName',
    formik.values.roomName,
    isEditing
  );
  const fieldError = (name: keyof RoomFormValues) =>
    formik.touched[name] ? (formik.errors[name] as string | undefined) : undefined;
  return (
    <FormSectionCard
      title="Basic Details"
      icon="mdi:door-open"
      descriptionTooltip="Select a building before choosing its floor. Room type identifies how the room is used."
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={Boolean(fieldError('roomName'))}>
            <TextField
              fullWidth
              size="small"
              required
              label="Room name/no."
              name="roomName"
              value={formik.values.roomName}
              onChange={(event) =>
                formik.setFieldValue(
                  'roomName',
                  event.target.value.replace(/[^a-zA-Z-:0-9\s]/g, '')
                )
              }
              onBlur={formik.handleBlur}
              error={!!fieldError('roomName')}
              helperText={fieldError('roomName') || namePreview}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={Boolean(fieldError('building'))}>
            <CustomSelect
              label="Building"
              required
              name="building"
              size="small"
              disabled={loading}
              isLoading={loading}
              options={buildings}
              labelKey="buildingName"
              valueKey="id"
              value={formik.values.building}
              onChange={(value) => {
                formik.setFieldValue('building', value);
                formik.setFieldValue('floor', '');
              }}
              onBlur={formik.handleBlur}
              formControlProps={{ fullWidth: true }}
              error={!!fieldError('building')}
              helperText={fieldError('building')}
              noOptionsMessage="No buildings available"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={Boolean(fieldError('floor'))}>
            <CustomSelect
              label="Floor"
              required
              name="floor"
              size="small"
              disabled={loading || !formik.values.building}
              isLoading={loading}
              options={floors}
              labelKey="floorName"
              valueKey="id"
              value={formik.values.floor}
              onChange={(value) => formik.setFieldValue('floor', value)}
              onBlur={formik.handleBlur}
              formControlProps={{ fullWidth: true }}
              error={!!fieldError('floor')}
              helperText={fieldError('floor')}
              noOptionsMessage="No floors available for this building"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={Boolean(fieldError('roomType'))}>
            <CustomSelect
              label="Room type"
              required
              name="roomType"
              size="small"
              disabled={loading}
              isLoading={loading}
              options={roomTypes}
              labelKey="roomTypeName"
              valueKey="id"
              value={formik.values.roomType}
              onChange={(value) => formik.setFieldValue('roomType', value)}
              onBlur={formik.handleBlur}
              formControlProps={{ fullWidth: true }}
              error={!!fieldError('roomType')}
              helperText={fieldError('roomType')}
              noOptionsMessage="No room types available"
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
