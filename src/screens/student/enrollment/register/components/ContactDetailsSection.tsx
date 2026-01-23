import React from 'react';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Divider, TextField, InputAdornment } from '@mui/material';
import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { SectionProps } from './section-types';

const ContactDetailsSection: React.FC<SectionProps> = ({
  formik,
  isMainForm,
  isEdit,
  onSave,
  onCancel,
}) => (
  <SectionCard
    title="Contact Details"
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
    <Grid size={{ xs: 12, md: 4 }}>
      <ShakingTextField
        error={
          (formik.touched as any).primaryContactNumber &&
          Boolean((formik.errors as any).primaryContactNumber)
        }
      >
        <PhoneInput
          name="primaryContactNumber"
          disabled={!isEdit.value}
          value={(formik.values as any).primaryContactNumber}
          onChange={(value) => {
            formik.setFieldValue('primaryContactNumber', value);
            formik.setFieldTouched('primaryContactNumber', true, true);
          }}
          label="Primary Contact No *"
          error={
            (formik.touched as any).primaryContactNumber &&
            Boolean((formik.errors as any).primaryContactNumber)
          }
          helperText={
            (formik.touched as any).primaryContactNumber &&
            (formik.errors as any).primaryContactNumber
          }
          onBlur={formik.handleBlur as any}
          variant="outlined"
          size="small"
        />
      </ShakingTextField>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <ShakingTextField
        error={
          (formik.touched as any).secondaryContactNumber &&
          Boolean((formik.errors as any).secondaryContactNumber)
        }
      >
        <PhoneInput
          name="secondaryContactNumber"
          value={(formik.values as any).secondaryContactNumber}
          disabled={!isEdit.value}
          onChange={(value) => {
            formik.setFieldValue('secondaryContactNumber', value);
            formik.setFieldTouched('secondaryContactNumber', true, true);
          }}
          label="Secondary Contact No."
          onBlur={formik.handleBlur as any}
          error={
            (formik.touched as any).secondaryContactNumber &&
            Boolean((formik.errors as any).secondaryContactNumber)
          }
          helperText={
            (formik.touched as any).secondaryContactNumber &&
            (formik.errors as any).secondaryContactNumber
          }
          variant="outlined"
          size="small"
        />
      </ShakingTextField>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <ShakingTextField
        error={(formik.touched as any).email && Boolean((formik.errors as any).email)}
      >
        <TextField
          key="email"
          size="small"
          label="Primary Email"
          name="email"
          value={(formik.values as any).email}
          onBlur={formik.handleBlur}
          error={(formik.touched as any).email && Boolean((formik.errors as any).email)}
          helperText={(formik.touched as any).email && (formik.errors as any).email}
          fullWidth
          onChange={(e) => {
            formik.setFieldValue('email', e.target.value);
            formik.setFieldTouched('email', true);
          }}
          disabled={!isEdit.value}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="mdi-light:email" />
                  <Divider orientation="vertical" flexItem sx={{ height: 24 }} />
                </Box>
              </InputAdornment>
            ),
          }}
        />
      </ShakingTextField>
    </Grid>
  </SectionCard>
);

export default ContactDetailsSection;
