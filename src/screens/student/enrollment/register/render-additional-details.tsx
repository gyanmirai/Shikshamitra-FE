import { Grid, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { YesNoArray } from 'src/enums/yes-no';
import { CategoryArray } from 'src/enums/studnet-category';
import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import PhoneInput from 'src/components/phone-input';
import CustomSelect from 'src/components/custom-select';

import type { FieldsType } from './type';

const RenderAdditionalDetails = (props: any) => {
  const { formik, isEdit, isMainForm = false } = props;
  const isAdditionalDetailsEditable = useBoolean(isMainForm);

  const handleSave = async () => {
    await formik?.submitForm?.();
    formik.resetForm({ values: formik.values });
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
      <Grid item xs={6} sm={4}>
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

      <Grid item xs={6} sm={4}>
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

      <Grid item xs={6} sm={4}>
        <TextField
          fullWidth
          label="BPL Card No."
          size="small"
          disabled={!isAdditionalDetailsEditable.value}
          value={formik.values.bplCardNo}
          onChange={(e) => {
            const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
            formik.setFieldValue('bplCardNo', onlyNumbers);
          }}
          error={formik.touched.bplCardNo && Boolean(formik.errors.bplCardNo)}
          helperText={formik.touched.bplCardNo && formik.errors.bplCardNo}
        />
      </Grid>

      <Grid item xs={6} sm={4}>
        <CustomSelect
          disabled={!isAdditionalDetailsEditable.value}
          options={YesNoArray as any}
          label="Person With Disability"
          value={formik.values.personWithDisability}
          onChange={(value) => formik.setFieldValue('personWithDisability', value)}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={formik.touched.personWithDisability && Boolean(formik.errors.personWithDisability)}
          helperText={formik.touched.personWithDisability && formik.errors.personWithDisability}
        />
      </Grid>

      <Grid item xs={6} sm={4}>
        <TextField
          fullWidth
          label="Second Language"
          size="small"
          disabled={!isAdditionalDetailsEditable.value}
          value={formik.values.secondLanguage}
          onChange={(e) => formik.setFieldValue('secondLanguage', e.target.value)}
          error={formik.touched.secondLanguage && Boolean(formik.errors.secondLanguage)}
          helperText={formik.touched.secondLanguage && formik.errors.secondLanguage}
        />
      </Grid>

      <Grid item xs={6} sm={4}>
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

      <Grid item xs={6} sm={4}>
        <TextField
          fullWidth
          label="Relation Name"
          size="small"
          disabled={!isAdditionalDetailsEditable.value}
          value={formik.values.relationName}
          onChange={(e) => {
            const onlyText = e.target.value.replace(/[^a-zA-Z]/g, '');
            formik.setFieldValue('relationName', onlyText);
          }}
          error={formik.touched.relationName && Boolean(formik.errors.relationName)}
          helperText={formik.touched.relationName && formik.errors.relationName}
        />
      </Grid>

      <Grid item xs={6} sm={4}>
        <TextField
          fullWidth
          label="Relation"
          size="small"
          disabled={!isAdditionalDetailsEditable.value}
          value={formik.values.relation}
          onChange={(e) => {
            const onlyText = e.target.value.replace(/[^a-zA-Z]/g, '');
            formik.setFieldValue('relation', onlyText);
          }}
          error={formik.touched.relation && Boolean(formik.errors.relation)}
          helperText={formik.touched.relation && formik.errors.relation}
        />
      </Grid>

      <Grid item xs={6} sm={4}>
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

      <Grid item xs={6} sm={4}>
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
    </SectionCard>
  );
};

export const additionalDetailsFields: FieldsType[] = [
  {
    name: 'category',
    label: 'Category',
    type: 'text',
    otherProps: {},
    gridProps: { xs: 12, sm: 12, md: 12 },
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
