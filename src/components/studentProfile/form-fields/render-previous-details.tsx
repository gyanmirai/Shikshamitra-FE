import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { Grid, TextField, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { toNumericWithMax, toAlphanumericTitleCase } from 'src/utils/input-format';
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
    { label: 'GSEB', value: 'GSEB' },
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
      {/* <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <TextField
          size="small"
          fullWidth
          label="Name"
          name="schoolName"
          value={formik.values.schoolName}
          onChange={(e: any) => {
            const onlyText = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            const result = onlyText
              .split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');

            formik.setFieldValue('schoolName', result);
          }}
          disabled={!isEditable.value}
        />
      </Grid> */}

      <Grid size={{ xs: 12, md: 3 }}>
        <ShakingTextField
          error={
            (formik.touched as any).previousSchool && Boolean((formik.errors as any).previousSchool)
          }
        >
          <TextField
            key="previousSchool"
            size="small"
            label="Previous School"
            name="previousSchool"
            value={(formik.values as any).previousSchool}
            onBlur={formik.handleBlur}
            error={
              (formik.touched as any).previousSchool &&
              Boolean((formik.errors as any).previousSchool)
            }
            helperText={
              (formik.touched as any).previousSchool && (formik.errors as any).previousSchool
            }
            fullWidth
            onChange={(e) => {
              formik.setFieldValue('previousSchool', toAlphanumericTitleCase(e.target.value));
              formik.setFieldTouched('previousSchool', true, true);
            }}
            disabled={!isEditable.value}
          />
        </ShakingTextField>
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
          value={formik.values.tcNumber || ''}
          inputProps={{
            maxLength: 20,
            style: { textTransform: 'uppercase' },
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Allows uppercase letters, numbers, slashes (/), and hyphens (-)
            const formattedValue = e.target.value.toUpperCase().replace(/[^A-Z0-9/-]/g, '');
            formik.setFieldValue('tcNumber', formattedValue);
          }}
          error={formik.touched.tcNumber && Boolean(formik.errors.tcNumber)}
          helperText={formik.touched.tcNumber && formik.errors.tcNumber}
          disabled={!isEditable.value}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <ShakingTextField
          error={
            (formik.touched as any).schoolIndexNumber &&
            Boolean((formik.errors as any).schoolIndexNumber)
          }
        >
          <TextField
            size="small"
            fullWidth
            label="School Index Number"
            name="schoolIndexNumber"
            value={formik.values.schoolIndexNumber || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              let val = e.target.value.toUpperCase();
              val = val.replace(/[^A-Z0-9-]/g, '');
              val = val.replace(/-{2,}/g, '-');
              formik.setFieldValue('schoolIndexNumber', val.slice(0, 20));
            }}
            error={
              (formik.touched as any).schoolIndexNumber &&
              Boolean((formik.errors as any).schoolIndexNumber)
            }
            helperText={
              (formik.touched as any).schoolIndexNumber && (formik.errors as any).schoolIndexNumber
            }
            disabled={!isEditable.value}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <ShakingTextField
          error={
            (formik.touched as any).lastClassPassed &&
            Boolean((formik.errors as any).lastClassPassed)
          }
        >
          <TextField
            key="lastClassPassed"
            size="small"
            label="Last Class Passed"
            name="lastClassPassed"
            value={(formik.values as any).lastClassPassed}
            onBlur={formik.handleBlur}
            error={
              (formik.touched as any).lastClassPassed &&
              Boolean((formik.errors as any).lastClassPassed)
            }
            helperText={
              (formik.touched as any).lastClassPassed && (formik.errors as any).lastClassPassed
            }
            fullWidth
            onChange={(e) => {
              formik.setFieldValue('lastClassPassed', toNumericWithMax(e.target.value, 10));
              formik.setFieldTouched('lastClassPassed', true, true);
            }}
            disabled={!isEditable.value}
          />
        </ShakingTextField>
      </Grid>

      {/* Academic Info Section */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1">Academic Info</Typography>
      </Grid>
      {/* <Grid size={{ xs: 12, sm: 4, md: 3 }}>
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
      </Grid> */}
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
