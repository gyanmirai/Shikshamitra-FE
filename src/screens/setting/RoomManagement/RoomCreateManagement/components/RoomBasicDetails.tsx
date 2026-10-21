import type { FormikProps } from 'formik';

import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { capitalizeFirstLetter } from 'src/utils/input-format';
import { FormSectionCard } from 'src/components/form-section-card';

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
}

export function RoomBasicDetails({ formik, buildings, floors, roomTypes, loading }: Props) {
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
          <TextField
            fullWidth
            size="small"
            required
            label="Room Name/No."
            name="roomName"
            value={formik.values.roomName}
            onChange={(event) =>
              formik.setFieldValue(
                'roomName',
                capitalizeFirstLetter(event.target.value.replace(/[^a-zA-Z-:0-9\s]/g, ''))
              )
            }
            onBlur={formik.handleBlur}
            error={!!fieldError('roomName')}
            helperText={fieldError('roomName')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomSelect
            label="Building *"
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
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomSelect
            label="Floor *"
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
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomSelect
            label="Room Type *"
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
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
