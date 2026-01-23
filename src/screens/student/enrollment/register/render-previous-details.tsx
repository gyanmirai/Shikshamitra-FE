import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { Grid, TextField, Typography } from '@mui/material';
import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { FieldsType } from './type';

export const previousSchoolFields: FieldsType[] = [
  {
    name: 'schoolName',
    label: ' School Name',
    gridProps: { size: { xs: 12, sm: 12, md: 12 } },
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
  const boardOptions = [
    { label: 'CBSE', value: 'CBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'State Board', value: 'State Board' },
    { label: 'IB', value: 'IB' },
    { label: 'Cambridge', value: 'Cambridge' },
  ];
  const mediumOptions = [
    { label: 'English', value: 'English' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'Marathi', value: 'Marathi' },
    { label: 'Bengali', value: 'Bengali' },
    { label: 'Gujarati', value: 'Gujarati' },
    { label: 'Tamil', value: 'Tamil' },
    { label: 'Telugu', value: 'Telugu' },
    { label: 'Urdu', value: 'Urdu' },
    { label: 'Kannada', value: 'Kannada' },
    { label: 'Malayalam', value: 'Malayalam' },
  ];
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
      title="Previous School Details"
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
      {/* School Info Section */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1">School Info</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <TextField
          size="small"
          fullWidth
          label="Name"
          name="schoolName"
          value={formik.values.schoolName}
          onChange={(e: any) => {
            const onlyText = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            const words = onlyText.split(' ').filter(Boolean);
            const capitalizedWords = words.map(
              (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            );
            const result = capitalizedWords.join(' ');
            formik.setFieldValue('schoolName', result);
          }}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <TextField
          size="small"
          fullWidth
          label="Address"
          name="schoolAddress"
          value={formik.values.schoolAddress}
          onChange={formik.handleChange}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <CustomSelect
          label="Board"
          options={boardOptions}
          value={formik.values.schoolBoard ?? ''}
          onChange={(val) => formik.setFieldValue('schoolBoard', val)}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <CustomSelect
          label="Medium"
          options={mediumOptions}
          value={formik.values.schoolMedium ?? ''}
          onChange={(val) => formik.setFieldValue('schoolMedium', val)}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <TextField
          size="small"
          fullWidth
          label="TC Number"
          name="tcNumber"
          value={formik.values.tcNumber}
          onChange={(e: any) => {
            const onlyText = e.target.value.replace(/[^0-9]/g, '').slice(0, 20);
            formik.setFieldValue('tcNumber', onlyText);
          }}
          disabled={!isEditable.value}
        />
      </Grid>
      {/* Academic Info Section */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1">Academic Info</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <TextField
          size="small"
          fullWidth
          label="Class"
          name="previousClass"
          value={formik.values.previousClass}
          onChange={(e: any) => {
            const sanitized = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
            formik.setFieldValue('previousClass', sanitized);
          }}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <TextField
          size="small"
          fullWidth
          label="Percentage %"
          name="percentage"
          type="number"
          value={formik.values.percentage}
          onChange={(e: any) => {
            const val = e.target.value;
            if (val === '') {
              formik.setFieldValue('percentage', '');
              return;
            }
            const num = Number(val.replace(/[^0-9]/g, ''));
            const clamped = Math.max(0, Math.min(100, num));
            formik.setFieldValue('percentage', clamped);
          }}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          inputProps={{ min: 0, max: 100 }}
          disabled={!isEditable.value}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 8, md: 6 }}>
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          label="Reason for Leaving"
          name="reasonForLeaving"
          value={formik.values.reasonForLeaving ?? ''}
          onChange={(e: any) => {
            const val = e.target.value.trimStart();
            formik.setFieldValue('reasonForLeaving', val);
          }}
          disabled={!isEditable.value}
        />
      </Grid>
    </SectionCard>
  );
};
