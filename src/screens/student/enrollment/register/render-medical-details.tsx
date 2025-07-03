import { Grid, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { FieldsType } from './type';

const RenderMedicalFields = (props: any) => {
  const { formik, isMainForm = false } = props;
  const isMedicalEditable = useBoolean(isMainForm);
  const handleSave = () => {
    formik.submitForm();
  };

  const handleCancel = () => {};
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
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Weight (KG)"
          type="number"
          name="weight"
          size="small"
          disabled={!isMedicalEditable.value}
          value={formik.values.weight}
          onChange={formik.handleChange}
          autoFocus
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Height (CM)"
          type="number"
          name="height"
          size="small"
          value={formik.values.height}
          onChange={formik.handleChange}
          disabled={!isMedicalEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Body Mass Index (BMI)"
          type="number"
          name="bmi"
          size="small"
          value={formik.values.bmi}
          onChange={formik.handleChange}
          disabled={!isMedicalEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Pulse Rate"
          type="number"
          name="pulseRate"
          size="small"
          value={formik.values.pulseRate}
          onChange={formik.handleChange}
          disabled={!isMedicalEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Haemoglobin (HB)"
          name="haemoglobin"
          size="small"
          value={formik.values.haemoglobin}
          onChange={formik.handleChange}
          disabled={!isMedicalEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Covid Vaccination (DOSE) *"
          type="number"
          name="covidVaccination"
          size="small"
          value={formik.values.covidVaccination}
          onChange={formik.handleChange}
          error={formik.touched.covidVaccination && Boolean(formik.errors.covidVaccination)}
          helperText={formik.touched.covidVaccination && formik.errors.covidVaccination}
          disabled={!isMedicalEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
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

      <Grid item xs={12} sm={6} md={4}>
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
      <Grid item xs={12} sm={6} md={4}>
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
    gridProps: { xs: 12, sm: 12, md: 12 },
    otherProps: { autoFocus: true },
    renderComp(props: any) {
      return <RenderMedicalFields {...props} />;
    },
  },
];
