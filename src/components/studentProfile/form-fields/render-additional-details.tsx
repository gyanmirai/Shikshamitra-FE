import { YesNoArray } from 'src/enums/yes-no';
import { useBoolean } from 'src/hooks/use-boolean';
import PhoneInput from 'src/components/phone-input';
import CustomSelect from 'src/components/custom-select';
import { CategoryArray } from 'src/enums/studnet-category';
import { Grid, Switch, TextField, FormControlLabel } from '@mui/material';
import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { FieldsType } from './type';

const RenderAdditionalDetails = (props: any) => {
  const { formik, isMainForm = false } = props;
  const isAdditionalDetailsEditable = useBoolean(isMainForm);

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
            isEdit={isAdditionalDetailsEditable}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )
      }
    >
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          options={CategoryArray}
          disabled={!isAdditionalDetailsEditable.value}
          label="Category"
          value={formik.values.category}
          onChange={(value) => formik.setFieldValue('category', value)}
          autoFocus
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={formik.touched.category && Boolean(formik.errors.category)}
          helperText={formik.touched.category && formik.errors.category}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          disabled={!isAdditionalDetailsEditable.value}
          options={YesNoArray as any}
          label="BPL Student"
          value={formik.values.bplStudent}
          onChange={(value) => formik.setFieldValue('bplStudent', value)}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={formik.touched.bplStudent && Boolean(formik.errors.bplStudent)}
          helperText={formik.touched.bplStudent && formik.errors.bplStudent}
        />
      </Grid>

      {formik.values.bplStudent && (
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="BPL Card No."
            size="small"
            disabled={!isAdditionalDetailsEditable.value}
            value={formik.values.bplCardNo || ''}
            inputProps={{
              maxLength: 15,
              style: { textTransform: 'uppercase' }, // Visual hint for uppercase
            }}
            onChange={(e) => {
              // Strip non-alphanumeric characters and force uppercase
              const formattedValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              formik.setFieldValue('bplCardNo', formattedValue);
            }}
            error={formik.touched.bplCardNo && Boolean(formik.errors.bplCardNo)}
            helperText={formik.touched.bplCardNo && formik.errors.bplCardNo}
          />
        </Grid>
      )}

      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          label="Second Language"
          size="small"
          disabled={!isAdditionalDetailsEditable.value}
          value={formik.values.secondLanguage}
          onChange={(e) => {
            const onlyText = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            formik.setFieldValue('secondLanguage', onlyText);
          }}
          error={formik.touched.secondLanguage && Boolean(formik.errors.secondLanguage)}
          helperText={formik.touched.secondLanguage && formik.errors.secondLanguage}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <PhoneInput
          disabled={!isAdditionalDetailsEditable.value}
          name="emergencyContactNo"
          value={formik.values.emergencyContactNo}
          onChange={(value) => formik.setFieldValue('emergencyContactNo', value)}
          label="Emergency Contact No."
          error={formik.touched.emergencyContactNo && Boolean(formik.errors.emergencyContactNo)}
          helperText={formik.touched.emergencyContactNo && formik.errors.emergencyContactNo}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          label="Emergency Relative Name"
          size="small"
          disabled={!isAdditionalDetailsEditable.value}
          value={formik.values.relationName}
          onChange={(e) => {
            const onlyText = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            const capitalLatter = onlyText
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            formik.setFieldValue('relationName', capitalLatter);
          }}
          error={formik.touched.relationName && Boolean(formik.errors.relationName)}
          helperText={formik.touched.relationName && formik.errors.relationName}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          label="Emergency Relation"
          size="small"
          disabled={!isAdditionalDetailsEditable.value}
          value={formik.values.relation}
          onChange={(e) => {
            const onlyText = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            const capitalLatter = onlyText
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            formik.setFieldValue('relation', capitalLatter);
          }}
          error={formik.touched.relation && Boolean(formik.errors.relation)}
          helperText={formik.touched.relation && formik.errors.relation}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          disabled={!isAdditionalDetailsEditable.value}
          options={YesNoArray as any}
          label="Single Parent Child"
          size="small"
          value={formik.values.singleParentChild}
          onChange={(value) => formik.setFieldValue('singleParentChild', value)}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={formik.touched.singleParentChild && Boolean(formik.errors.singleParentChild)}
          helperText={formik.touched.singleParentChild && formik.errors.singleParentChild}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          disabled={!isAdditionalDetailsEditable.value}
          options={YesNoArray as any}
          label="Single Child"
          size="small"
          value={formik.values.singleChild}
          onChange={(value) => formik.setFieldValue('singleChild', value)}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={formik.touched.singleChild && Boolean(formik.errors.singleChild)}
          helperText={formik.touched.singleChild && formik.errors.singleChild}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <FormControlLabel
          control={
            <Switch
              disabled={!isAdditionalDetailsEditable.value}
              checked={formik.values.libraryMember}
              onChange={(e, val) => formik.setFieldValue('libraryMember', val)}
              name="libraryMember"
            />
          }
          label="Library Member?"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <FormControlLabel
          control={
            <Switch
              disabled={!isAdditionalDetailsEditable.value}
              checked={formik.values.transportMember}
              onChange={(e, val) => formik.setFieldValue('transportMember', val)}
              name="transportMember"
            />
          }
          label="Transport Member?"
        />
      </Grid>
    </SectionCard>
  );
};

export const additionalDetailsFields: FieldsType[] = [
  {
    name: 'category',
    label: 'Category',
    type: 'text',
    otherProps: {},
    gridProps: { size: { xs: 12, sm: 12, md: 12 } },
    renderComp(props: any) {
      return <RenderAdditionalDetails {...props} />;
    },
  },
  // {
  //   name: 'sponsorStudent',
  //   label: 'Student Referrer',
  //   type: 'text',
  //   otherProps: {},
  //   renderComp: (props) => <RenderStudent {...props} />,
  // },
  // {
  //   name: 'sponsorName ',
  //   label: 'Sponsor Name',
  //   type: 'text',
  //   otherProps: {},
  // },
];
