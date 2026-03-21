import type { FormikProps } from 'formik';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Checkbox, TextField, FormControlLabel } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  useGetfuelTypeOptionsQuery,
  useGetvehicleTypeOptionsQuery,
} from 'src/redux/transport/vehicle-management/vehicleDocumentDataApi';

import type { IVehiclePayload } from '../components/type';

interface VehicleGeneralStepProps {
  formik: FormikProps<IVehiclePayload>;
}

const VehicleGeneralStep = ({ formik }: VehicleGeneralStepProps) => {
  const { data: vehicleTypeOptions } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetvehicleTypeOptionsQuery,
  });

  const { data: fuelTypeOptions } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetfuelTypeOptionsQuery,
  });

  return (
    <SectionCard title="Basic Information">
      <Grid container spacing={2}>
        {/* Registration No. */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ mb: 1 }}>
          <ShakingTextField
            error={!!(formik.touched.registrationNo && formik.errors.registrationNo)}
          >
            <TextField
              fullWidth
              name="registrationNo"
              label="Registration No. *"
              value={formik.values.registrationNo}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                value = value.toUpperCase();
                formik.setFieldValue('registrationNo', value);
              }}
              error={!!(formik.touched.registrationNo && formik.errors.registrationNo)}
              helperText={formik.touched.registrationNo && formik.errors.registrationNo}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Vehicle No. */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.vehicleNo && formik.errors.vehicleNo)}>
            <TextField
              fullWidth
              name="vehicleNo"
              label="Vehicle No. *"
              value={formik.values.vehicleNo}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9-\s]/g, '');
                value = value.toUpperCase();
                formik.setFieldValue('vehicleNo', value);
              }}
              error={!!(formik.touched.vehicleNo && formik.errors.vehicleNo)}
              helperText={formik.touched.vehicleNo && formik.errors.vehicleNo}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Vehicle Type */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.vehicleType && formik.errors.vehicleType)}>
            <CustomSelect
              label="Vehicle Type *"
              name="vehicleType"
              options={vehicleTypeOptions || []}
              value={formik.values.vehicleType}
              onChange={(value) => formik.setFieldValue('vehicleType', value)}
              error={!!(formik.touched.vehicleType && formik.errors.vehicleType)}
              helperText={formik.touched.vehicleType ? formik.errors.vehicleType : undefined}
              formControlProps={{ fullWidth: true }}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Vehicle Company */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ mb: 1 }}>
          <ShakingTextField
            error={!!(formik.touched.vehicleCompany && formik.errors.vehicleCompany)}
          >
            <TextField
              fullWidth
              name="vehicleCompany"
              label="Vehicle Company *"
              value={formik.values.vehicleCompany}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                // Capitalize first letter of each word
                value = value.replace(/\b\w/g, (char) => char.toUpperCase());
                formik.setFieldValue('vehicleCompany', value);
              }}
              error={!!(formik.touched.vehicleCompany && formik.errors.vehicleCompany)}
              helperText={formik.touched.vehicleCompany && formik.errors.vehicleCompany}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Model */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.model && formik.errors.model)}>
            <TextField
              fullWidth
              name="model"
              label="Model *"
              value={formik.values.model}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
                // Capitalize first letter of each word
                value = value.replace(/\b\w/g, (char) => char.toUpperCase());
                formik.setFieldValue('model', value);
              }}
              error={!!(formik.touched.model && formik.errors.model)}
              helperText={formik.touched.model && formik.errors.model}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Year of Manufacture */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.yearOfManufacture && formik.errors.yearOfManufacture)}
          >
            <TextField
              fullWidth
              name="yearOfManufacture"
              label="Year of Manufacture *"
              value={formik.values.yearOfManufacture}
              onChange={(e) => {
                // Only allow numbers and limit to 4 digits
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                formik.setFieldValue('yearOfManufacture', value);
              }}
              error={!!(formik.touched.yearOfManufacture && formik.errors.yearOfManufacture)}
              helperText={formik.touched.yearOfManufacture && formik.errors.yearOfManufacture}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Seating Capacity */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ mb: 1 }}>
          <ShakingTextField
            error={!!(formik.touched.seatingCapacity && formik.errors.seatingCapacity)}
          >
            <TextField
              fullWidth
              name="seatingCapacity"
              label="Seating Capacity *"
              value={formik.values.seatingCapacity === 0 ? '' : formik.values.seatingCapacity}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                formik.setFieldValue('seatingCapacity', value ? Number(value) : 0);
              }}
              error={!!(formik.touched.seatingCapacity && formik.errors.seatingCapacity)}
              helperText={formik.touched.seatingCapacity && formik.errors.seatingCapacity}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Vehicle Color */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.vehicleColor && formik.errors.vehicleColor)}>
            <TextField
              fullWidth
              name="vehicleColor"
              label="Vehicle Color *"
              value={formik.values.vehicleColor}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                // Capitalize first letter of each word
                value = value.replace(/\b\w/g, (char) => char.toUpperCase());
                formik.setFieldValue('vehicleColor', value);
              }}
              error={!!(formik.touched.vehicleColor && formik.errors.vehicleColor)}
              helperText={formik.touched.vehicleColor && formik.errors.vehicleColor}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* School Assigned No. */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.schoolAssignedNo && formik.errors.schoolAssignedNo)}
          >
            <TextField
              fullWidth
              name="schoolAssignedNo"
              label="School Assigned No."
              value={formik.values.schoolAssignedNo ?? ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                formik.setFieldValue('schoolAssignedNo', value);
              }}
              error={!!(formik.touched.schoolAssignedNo && formik.errors.schoolAssignedNo)}
              helperText={formik.touched.schoolAssignedNo && formik.errors.schoolAssignedNo}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Owner */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ mb: 1 }}>
          <ShakingTextField error={!!(formik.touched.owner && formik.errors.owner)}>
            <TextField
              fullWidth
              name="owner"
              label="Owner *"
              value={formik.values.owner}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                // Capitalize first letter of each word
                value = value.replace(/\b\w/g, (char) => char.toUpperCase());
                formik.setFieldValue('owner', value);
              }}
              error={!!(formik.touched.owner && formik.errors.owner)}
              helperText={formik.touched.owner && formik.errors.owner}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Fuel Type */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.fuelType && formik.errors.fuelType)}>
            <CustomSelect
              label="Fuel Type *"
              name="fuelType"
              options={fuelTypeOptions || []}
              value={formik.values.fuelType}
              onChange={(value) => formik.setFieldValue('fuelType', value)}
              error={!!(formik.touched.fuelType && formik.errors.fuelType)}
              helperText={formik.touched.fuelType ? formik.errors.fuelType : undefined}
              formControlProps={{ fullWidth: true }}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* AC / Non AC */}
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.isAc === true}
                onChange={(_, checked) => {
                  formik.setFieldValue('isAc', checked);
                  if (checked) formik.setFieldValue('isNonAc', false);
                }}
                name="isAc"
                color="primary"
              />
            }
            label="A.C."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.isNonAc === true}
                onChange={(_, checked) => {
                  formik.setFieldValue('isNonAc', checked);
                  if (checked) formik.setFieldValue('isAc', false);
                }}
                name="isNonAc"
                color="primary"
              />
            }
            label="Non A.C."
          />
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
            <TextField
              fullWidth
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={!!(formik.touched.description && formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              size="small"
              multiline
              minRows={2}
              maxRows={4}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </SectionCard>
  );
};
export default VehicleGeneralStep;
