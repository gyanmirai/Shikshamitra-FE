import { useEffect } from 'react';
import { YesNoArray } from 'src/enums/yes-no';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { BloodGroupArray } from 'src/enums/blood-group';
import { Grid, MenuItem, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { FieldsType } from './type';

// Covid Vaccination dose options
const COVID_VACCINATION_OPTIONS = [
  { value: '0', label: 'Not Vaccinated' },
  { value: '1', label: '1 Dose' },
  { value: '2', label: '2 Doses' },
  { value: '3', label: 'Booster (3+ Doses)' },
];

// Validation ranges for medical fields
const VALIDATION_RANGES = {
  weight: { min: 1, max: 200, unit: 'KG' },
  height: { min: 30, max: 250, unit: 'CM' },
  pulseRate: { min: 40, max: 200, unit: 'BPM' },
  haemoglobin: { min: 1, max: 25, unit: 'g/dL' },
};

const RenderMedicalFields = (props: any) => {
  const { formik, isMainForm = false } = props;
  const isMedicalEditable = useBoolean(isMainForm);

  // Auto-calculate BMI when weight or height changes
  useEffect(() => {
    const weight = parseFloat(formik.values.weight);
    const height = parseFloat(formik.values.height);

    if (weight > 0 && height > 0) {
      // BMI formula: weight (kg) / height² (m)
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      const roundedBmi = Math.round(bmi * 10) / 10; // Round to 1 decimal place

      // Only update if BMI has changed to avoid infinite loop
      if (formik.values.bmi !== roundedBmi.toString()) {
        formik.setFieldValue('bmi', roundedBmi.toString());
      }
    } else if (!formik.values.weight && !formik.values.height && formik.values.bmi) {
      // Clear BMI if both weight and height are empty
      formik.setFieldValue('bmi', '');
    }
  }, [formik.values.weight, formik.values.height, formik]);

  // Validate numeric input within range
  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: keyof typeof VALIDATION_RANGES
  ) => {
    const { value } = e.target;
    const range = VALIDATION_RANGES[fieldName];

    // Allow empty value or valid number within range
    if (value === '' || value === undefined) {
      formik.handleChange(e);
      return;
    }

    const numValue = parseFloat(value);
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(numValue) && numValue >= 0 && numValue <= range.max) {
      formik.handleChange(e);
    }
  };

  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    if (Object.keys(validation).length > 0) return false;
    try {
      await formik?.submitForm?.();
    } catch {
      return false;
    }

    formik.resetForm({ values: formik.values });
    return undefined;
  };
  const handleCancel = () => {
    formik.resetForm();
  };
  return (
    <SectionCard
      title=""
      headerContent={
        !isMainForm && (
          <CardActions
            isLoading={formik.isSubmitting}
            isEdit={isMedicalEditable}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )
      }
    >
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          label="Weight (KG)"
          type="number"
          name="weight"
          size="small"
          disabled={!isMedicalEditable.value}
          value={formik.values.weight}
          onChange={(e) => handleNumericChange(e, 'weight')}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          autoFocus
          inputProps={{ min: 1, max: 200 }}
          helperText={
            formik.values.weight &&
            (parseFloat(formik.values.weight) < 1 || parseFloat(formik.values.weight) > 200)
              ? 'Weight must be between 1-200 KG'
              : ''
          }
          error={
            formik.values.weight &&
            (parseFloat(formik.values.weight) < 1 || parseFloat(formik.values.weight) > 200)
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          label="Height (CM)"
          type="number"
          name="height"
          size="small"
          value={formik.values.height}
          onChange={(e) => handleNumericChange(e, 'height')}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          disabled={!isMedicalEditable.value}
          inputProps={{ min: 30, max: 250 }}
          helperText={
            formik.values.height &&
            (parseFloat(formik.values.height) < 30 || parseFloat(formik.values.height) > 250)
              ? 'Height must be between 30-250 CM'
              : ''
          }
          error={
            formik.values.height &&
            (parseFloat(formik.values.height) < 30 || parseFloat(formik.values.height) > 250)
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          label="Body Mass Index (BMI)"
          type="text"
          name="bmi"
          size="small"
          value={formik.values.bmi}
          disabled
          helperText="Calculated from Weight & Height"
          InputProps={{
            readOnly: true,
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          label="Pulse Rate (BPM)"
          type="number"
          name="pulseRate"
          size="small"
          value={formik.values.pulseRate}
          onChange={(e) => handleNumericChange(e, 'pulseRate')}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          disabled={!isMedicalEditable.value}
          inputProps={{ min: 40, max: 200 }}
          helperText={
            formik.values.pulseRate &&
            (parseFloat(formik.values.pulseRate) < 40 || parseFloat(formik.values.pulseRate) > 200)
              ? 'Pulse rate must be between 40-200 BPM'
              : ''
          }
          error={
            formik.values.pulseRate &&
            (parseFloat(formik.values.pulseRate) < 40 || parseFloat(formik.values.pulseRate) > 200)
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          label="Hemoglobin (g/dL)"
          name="haemoglobin"
          type="number"
          size="small"
          value={formik.values.haemoglobin}
          onChange={(e) => handleNumericChange(e, 'haemoglobin')}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          disabled={!isMedicalEditable.value}
          inputProps={{ min: 1, max: 25, step: 0.1 }}
          helperText={
            formik.values.haemoglobin &&
            (parseFloat(formik.values.haemoglobin) < 1 ||
              parseFloat(formik.values.haemoglobin) > 25)
              ? 'Hemoglobin must be between 1-25 g/dL'
              : ''
          }
          error={
            formik.values.haemoglobin &&
            (parseFloat(formik.values.haemoglobin) < 1 ||
              parseFloat(formik.values.haemoglobin) > 25)
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ShakingTextField
          error={!!(formik.touched.covidVaccination && formik.errors.covidVaccination)}
        >
          <TextField
            fullWidth
            select
            label="Covid Vaccination (Dose) *"
            name="covidVaccination"
            size="small"
            value={formik.values.covidVaccination || ''}
            onChange={formik.handleChange}
            error={formik.touched.covidVaccination && Boolean(formik.errors.covidVaccination)}
            helperText={formik.touched.covidVaccination && formik.errors.covidVaccination}
            disabled={!isMedicalEditable.value}
          >
            {COVID_VACCINATION_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CustomSelect
          disabled={!isMedicalEditable.value}
          options={BloodGroupArray as any}
          label="Blood Group"
          value={formik.values.bloodGroup}
          onChange={(value) => formik.setFieldValue('bloodGroup', value)}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={formik.touched.bloodGroup && Boolean(formik.errors.bloodGroup)}
          helperText={formik.touched.bloodGroup && formik.errors.bloodGroup}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          disabled={!isMedicalEditable.value}
          options={YesNoArray as any}
          label="Person With Disability"
          value={formik.values.personWithDisability}
          onChange={(value) => formik.setFieldValue('personWithDisability', value)}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={formik.touched.personWithDisability && Boolean(formik.errors.personWithDisability)}
          helperText={formik.touched.personWithDisability && formik.errors.personWithDisability}
        />
      </Grid>

      {(formik.values.personWithDisability === 'true' ||
        formik.values.personWithDisability === true) && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label="Details of Disability"
            multiline
            name="disabilityDetails"
            size="small"
            value={formik.values.disabilityDetails}
            onChange={formik.handleChange}
            disabled={!isMedicalEditable.value}
          />
        </Grid>
      )}

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          label="Allergies"
          multiline
          rows={4}
          name="allergies"
          size="small"
          value={formik.values.allergies}
          onChange={formik.handleChange}
          disabled={!isMedicalEditable.value}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          label="Child Immunization"
          multiline
          rows={4}
          name="childImmunisation"
          size="small"
          value={formik.values.childImmunisation}
          onChange={formik.handleChange}
          disabled={!isMedicalEditable.value}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          label="Immunization Remarks"
          multiline
          rows={4}
          name="immunisationRemarks"
          size="small"
          value={formik.values.immunisationRemarks}
          onChange={formik.handleChange}
          disabled={!isMedicalEditable.value}
        />
      </Grid>
    </SectionCard>
  );
};

export const medicalFields: FieldsType[] = [
  {
    name: 'weight',
    label: 'Weight (KG)',
    type: 'number',
    gridProps: { size: { xs: 12, sm: 12, md: 12 } },
    otherProps: { autoFocus: true },
    renderComp(props: any) {
      return <RenderMedicalFields {...props} />;
    },
  },
];
