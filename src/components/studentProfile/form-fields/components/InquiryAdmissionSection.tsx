import React from 'react';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import RenderBoard from '../RenderBoard';
import RenderClass from '../RenderClass';
import RenderMedium from '../RenderMedium';
import RenderAcademicYear from '../RenderAcademicYear';

import type { SectionProps } from './section-types';

const InquiryAdmissionSection: React.FC<SectionProps> = ({
  formik,
  isMainForm,
  isEdit,
}) => (
  <SectionCard
    title="Inquiry & Admission"
  >
    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).formNo && Boolean((formik.errors as any).formNo)}
      >
        <TextField
          fullWidth
          size="small"
          label="Form No. *"
          name="formNo"
          value={(formik.values as any).formNo}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          error={(formik.touched as any).formNo && Boolean((formik.errors as any).formNo)}
          helperText={(formik.touched as any).formNo && (formik.errors as any).formNo}
          disabled={!isMainForm || !isEdit.value}
          inputProps={{ maxLength: 20 }}
        />
      </ShakingTextField>
    </Grid>
    <Grid size={{ xs: 12, md: 3 }}>
      <RenderAcademicYear formik={formik} isEdit={Boolean(isMainForm && isEdit.value)} />
    </Grid>
    <Grid size={{ xs: 12, md: 3 }}>
      <RenderBoard formik={formik} isEdit={Boolean(isMainForm && isEdit.value)} />
    </Grid>
    <Grid size={{ xs: 12, md: 3 }}>
      <RenderMedium formik={formik} isEdit={Boolean(isMainForm && isEdit.value)} />
    </Grid>
    <Grid size={{ xs: 12, md: 3 }}>
      <RenderClass formik={formik} isEdit={Boolean(isMainForm && isEdit.value)} />
    </Grid>
  </SectionCard>
);

export default InquiryAdmissionSection;
