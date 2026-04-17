import type { FormikProps } from 'formik';

import CustomTooltip from 'src/components/custom-tooltip';
// Components
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';
import { Card, Grid, Divider, Skeleton, TextField, Typography } from '@mui/material';

import type { IInquiryFormValues } from '../../type';

interface AddressDetailsProps {
  formik: FormikProps<IInquiryFormValues>;
  loading: {
    isGetLoading: boolean;
  };
}

export const AddressDetails = ({ formik, loading }: AddressDetailsProps) => {
  const { values, touched, errors, setFieldValue, setValues } = formik;
  const { isGetLoading } = loading;

  if (isGetLoading) {
    return (
      <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Address Details
        </Typography>
        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <Grid size={{ xs: 12, md: 4 }} key={item}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
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
        Address Details
      </Typography>
      <Divider sx={{ my: 2, borderStyle: 'dashed', borderColor: 'divider' }} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(touched.addressLine1 && errors.addressLine1)}>
            <TextField
              name="addressLine1"
              label="House / Building / Flat *"
              value={values.addressLine1}
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 50) {
                  setFieldValue('addressLine1', value);
                }
              }}
              inputProps={{ maxLength: 50 }}
              error={touched.addressLine1 && Boolean(errors.addressLine1)}
              helperText={touched.addressLine1 && errors.addressLine1}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(touched.addressLine2 && errors.addressLine2)}>
            <TextField
              name="addressLine2"
              label="Area / Locality / Road Name *  "
              value={values.addressLine2}
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 50) {
                  setFieldValue('addressLine2', value);
                }
              }}
              inputProps={{ maxLength: 50 }}
              error={touched.addressLine2 && Boolean(errors.addressLine2)}
              helperText={(touched.addressLine2 && errors.addressLine2) || ''}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(touched.addressLine3 && errors.addressLine3)}>
            <TextField
              name="addressLine3"
              label="Landmark (Optional)"
              value={values.addressLine3}
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 50) {
                  setFieldValue('addressLine3', value);
                }
              }}
              inputProps={{ maxLength: 50 }}
              error={touched.addressLine3 && Boolean(errors.addressLine3)}
              helperText={(touched.addressLine3 && errors.addressLine3) || ''}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(touched.country && (errors.country as any)?.name)}>
            <CountryComponent
              value={values.country}
              onChange={(_e: any, value: any) => {
                setValues({
                  ...values,
                  country: { name: value?.name, isoCode: value?.isoCode },
                  state: { name: '', isoCode: '' },
                  city: { name: '' },
                });
              }}
              error={touched.country && Boolean((errors.country as any)?.name)}
              helperText={(touched.country && (errors.country as any)?.name) || ''}
              textFieldProps={{ label: 'Country *' }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(touched.state && (errors.state as any)?.name)}>
            <CustomTooltip
              title={!values.country?.name ? 'Please select Country first' : ''}
              arrow
              placement="top"
            >
              <span style={{ display: 'block' }}>
                <StateComponent
                  value={values.state}
                  onChange={(_e: any, value: any) => {
                    setValues({
                      ...values,
                      state: { ...(value || {}), name: value?.name, isoCode: value?.isoCode },
                      city: { name: '' },
                    });
                  }}
                  error={touched.state && Boolean((errors.state as any)?.name)}
                  helperText={touched.state && (errors.state as any)?.name}
                  countryValue={values.country}
                  textFieldProps={{ label: 'State *' }}
                />
              </span>
            </CustomTooltip>
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(touched.city && (errors.city as any)?.name)}>
            <CustomTooltip
              title={!values.state?.name ? 'Please select State first' : ''}
              arrow
              placement="top"
            >
              <span style={{ display: 'block' }}>
                <CityComponent
                  value={values.city}
                  onChange={(_e: any, value: any) => {
                    setFieldValue('city', { name: value?.name });
                  }}
                  error={touched.city && Boolean((errors.city as any)?.name)}
                  helperText={touched.city && (errors.city as any)?.name}
                  stateValue={values.state}
                  countryValue={values.country}
                  textFieldProps={{ label: 'City *' }}
                />
              </span>
            </CustomTooltip>
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(touched.pinCode && errors.pinCode)}>
            <TextField
              name="pinCode"
              value={values.pinCode}
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 6) {
                  setFieldValue('pinCode', value);
                }
              }}
              type="number"
              error={touched.pinCode && Boolean(errors.pinCode)}
              helperText={touched.pinCode && errors.pinCode}
              fullWidth
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              size="small"
              label="PIN Code"
              inputProps={{ maxLength: 6, min: 0 }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </Card>
  );
};
