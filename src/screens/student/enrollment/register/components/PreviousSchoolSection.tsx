import React from 'react';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { toNumericWithMax, toAlphanumericTitleCase } from 'src/utils/input-format';
import {
  SectionCard,
  CardActions,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { SectionProps } from './section-types';

const PreviousSchoolSection: React.FC<SectionProps> = ({
  formik,
  isMainForm,
  isEdit,
  onSave,
  onCancel,
}) => (
  <SectionCard
    title="Previous School"
    headerContent={
      !isMainForm && (
        <CardActions
          isLoading={formik.isSubmitting}
          isEdit={isEdit}
          onSave={onSave}
          onCancel={onCancel}
        />
      )
    }
  >
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
            (formik.touched as any).previousSchool && Boolean((formik.errors as any).previousSchool)
          }
          helperText={
            (formik.touched as any).previousSchool && (formik.errors as any).previousSchool
          }
          fullWidth
          onChange={(e) => {
            formik.setFieldValue('previousSchool', toAlphanumericTitleCase(e.target.value));
            formik.setFieldTouched('previousSchool', true, true);
          }}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={
          (formik.touched as any).lastClassPassed && Boolean((formik.errors as any).lastClassPassed)
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
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>
  </SectionCard>
);

export default PreviousSchoolSection;
