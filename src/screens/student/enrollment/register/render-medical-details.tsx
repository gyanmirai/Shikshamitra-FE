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
  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;

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
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
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
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
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
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
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
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          disabled={!isMedicalEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Hemoglobin (HB)"
          name="haemoglobin"
          type="number"
          size="small"
          value={formik.values.haemoglobin}
          onChange={(e) => {
            const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
            formik.setFieldValue('haemoglobin', onlyNumbers);
          }}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
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
          onChange={(e) => {
            const { value } = e.target;
            // Only allow single digit numbers
            if (value.length <= 1 && /^[0-9]*$/.test(value)) {
              formik.handleChange(e);
            }
          }}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          error={formik.touched.covidVaccination && Boolean(formik.errors.covidVaccination)}
          helperText={formik.touched.covidVaccination && formik.errors.covidVaccination}
          disabled={!isMedicalEditable.value}
          inputProps={{ maxLength: 1 }}
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
