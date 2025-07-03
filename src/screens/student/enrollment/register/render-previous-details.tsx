import { capitalize } from 'lodash';

import { Grid, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { FieldsType } from './type';

export const previousSchoolFields: FieldsType[] = [
  {
    name: 'schoolName',
    label: ' School Name',
    gridProps: { xs: 12, sm: 12, md: 12 },
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = e.target.value
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        formik.setFieldValue('schoolName', newName);
        formik.setFieldTouched('schoolName', true, true);
      },
      autoFocus: true,
    }),
    renderComp(props: any) {
      return <RenderPreviousSchoolFields {...props} />;
    },
  },
];

const RenderPreviousSchoolFields = (props: any) => {
  const { formik, isMainForm = false } = props;
  const isEditable = useBoolean(isMainForm);
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
            isEdit={isEditable}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )
      }
    >
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          size="small"
          fullWidth
          label="School Name"
          name="schoolName"
          value={formik.values.schoolName}
          onChange={(e: any) => {
            const newName = capitalize(e.target.value);
            formik.setFieldValue('schoolName', newName);
          }}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          size="small"
          fullWidth
          label="School Address"
          name="schoolAddress"
          value={formik.values.schoolAddress}
          onChange={formik.handleChange}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          size="small"
          fullWidth
          label="School Board"
          name="schoolBoard"
          value={formik.values.schoolBoard}
          onChange={(e: any) => {
            const newName = capitalize(e.target.value);
            formik.setFieldValue('schoolBoard', newName);
          }}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          size="small"
          fullWidth
          label="School Medium"
          name="schoolMedium"
          value={formik.values.schoolMedium}
          onChange={formik.handleChange}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          size="small"
          fullWidth
          label="TC Number"
          name="tcNumber"
          value={formik.values.tcNumber}
          onChange={formik.handleChange}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          size="small"
          fullWidth
          label="Class"
          name="previousClass"
          value={formik.values.previousClass}
          onChange={formik.handleChange}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          size="small"
          fullWidth
          label="Percentage %"
          name="percentage"
          type="number"
          value={formik.values.percentage}
          onChange={(e: any) => {
            const newName = capitalize(e.target.value);
            formik.setFieldValue('percentage', newName);
          }}
          disabled={!isEditable.value}
        />
      </Grid>
    </SectionCard>
  );
};
