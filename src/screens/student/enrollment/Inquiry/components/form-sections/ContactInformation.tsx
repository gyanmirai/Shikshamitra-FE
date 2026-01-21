import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
// Components
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Card, Grid, Divider, TextField, Typography, InputAdornment } from '@mui/material';

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

  if (isGetLoading) {
    return (
      <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Contact Information
        </Typography>
        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
        <Typography color="text.secondary">Loading...</Typography>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" fontWeight={600} color="text.primary">
        Contact Information
      </Typography>
      <Divider sx={{ my: 2, borderStyle: 'dashed', borderColor: 'divider' }} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(touched.primaryContactNumber && errors.primaryContactNumber)}>
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
            error={!!(touched.secondaryContactNumber && errors.secondaryContactNumber)}
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
          <ShakingTextField error={!!(touched.email && errors.email)}>
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
      </Grid>
    </Card>
  );
};
