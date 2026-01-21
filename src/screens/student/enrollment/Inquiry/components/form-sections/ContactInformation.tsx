import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { Box, Grid, Divider, TextField, InputAdornment } from '@mui/material'; // Ensure this path is correct based on original file

// Components
import ShakingTextField from 'src/components/shaking-text-field';

import { CollapsibleFormSection } from '../common/CollapsibleFormSection';

import type { IInquiryFormValues } from '../../type';

interface ContactInformationProps {
  formik: FormikProps<IInquiryFormValues>;
  loading: {
    isGetLoading: boolean;
  };
}

export const ContactInformation = ({ formik, loading }: ContactInformationProps) => {
  const { values, touched, errors, setFieldValue } = formik;
  const { isGetLoading } = loading;

  const contactError =
    (!!touched.primaryContactNumber && !!errors.primaryContactNumber) ||
    (!!touched.secondaryContactNumber && !!errors.secondaryContactNumber) ||
    (!!touched.email && !!errors.email);

  if (isGetLoading) {
    return (
      <CollapsibleFormSection title="Contact Information" step="Step 3 of 4" error={false}>
        Loading...
      </CollapsibleFormSection>
    );
  }

  return (
    <CollapsibleFormSection title="Contact Information" step="Step 3 of 4" error={contactError}>
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField
          error={!!(touched.primaryContactNumber && errors.primaryContactNumber) || false}
        >
          <PhoneInput
            name="primaryContactNumber"
            value={values.primaryContactNumber}
            onChange={(value) => {
              setFieldValue('primaryContactNumber', value);
            }}
            error={touched.primaryContactNumber && Boolean(errors.primaryContactNumber)}
            helperText={touched.primaryContactNumber && errors.primaryContactNumber}
            variant="outlined"
            label="Primary Contact No. *"
            size="small"
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField
          error={!!(touched.secondaryContactNumber && errors.secondaryContactNumber) || false}
        >
          <PhoneInput
            name="secondaryContactNumber"
            value={values.secondaryContactNumber}
            onChange={(value) => {
              setFieldValue('secondaryContactNumber', value || '');
            }}
            error={Boolean(touched.secondaryContactNumber && errors.secondaryContactNumber)}
            helperText={
              touched.secondaryContactNumber && errors.secondaryContactNumber
                ? errors.secondaryContactNumber
                : ''
            }
            variant="outlined"
            label="Secondary Contact No."
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(touched.email && errors.email) || false}>
          <TextField
            value={values.email}
            fullWidth
            size="small"
            name="email"
            label="Email"
            onChange={(e) => {
              const { value } = e.target;
              if (value.length <= 35) {
                setFieldValue('email', value);
              }
            }}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
            inputProps={{ maxLength: 35 }}
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
    </CollapsibleFormSection>
  );
};
