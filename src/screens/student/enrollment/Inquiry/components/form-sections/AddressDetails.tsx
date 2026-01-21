import type { FormikProps } from 'formik';

import { Grid, TextField } from '@mui/material';
// Components
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import { CollapsibleFormSection } from '../common/CollapsibleFormSection';

import type { IInquiryFormValues } from '../../type';

interface AddressDetailsProps {
  formik: FormikProps<IInquiryFormValues>;
  loading: {
    isGetLoading: boolean;
  };
}

export const AddressDetails = ({ formik, loading }: AddressDetailsProps) => {
  const { values, touched, errors, setFieldValue } = formik;
  const { isGetLoading } = loading;

  const addressError =
    (!!touched.addressLine1 && !!errors.addressLine1) ||
    (!!touched.country && !!(errors.country as any)?.name) ||
    (!!touched.state && !!(errors.state as any)?.name) ||
    (!!touched.city && !!(errors.city as any)?.name) ||
    (!!touched.pinCode && !!errors.pinCode);

  if (isGetLoading) {
    return (
      <CollapsibleFormSection title="Address Details" step="Step 4 of 4" error={false}>
        Loading...
      </CollapsibleFormSection>
    );
  }

  return (
    <CollapsibleFormSection title="Address Details" step="Step 4 of 4" error={addressError}>
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(touched.addressLine1 && errors.addressLine1) || false}>
          <TextField
            name="addressLine1"
            label="House / Building / Flat"
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
        <ShakingTextField error={!!(touched.addressLine2 && errors.addressLine2) || false}>
          <TextField
            name="addressLine2"
            label="Area / Locality / Road Name"
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
        <ShakingTextField error={!!(touched.addressLine3 && errors.addressLine3) || false}>
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
      <Grid size={4}>
        <ShakingTextField error={!!(touched.country && errors.country) || false}>
          <CountryComponent
            value={values.country}
            onChange={(_e: any, value: any) => {
              setFieldValue('state', { name: '', isoCode: '' });
              setFieldValue('country', {
                name: value?.name,
                isoCode: value?.isoCode,
              });
            }}
            error={touched.country && Boolean((errors.country as any)?.name)}
            helperText={(touched.country && (errors.country as any)?.name) || ''}
            textFieldProps={{ label: 'Country' }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={4}>
        <ShakingTextField error={!!(touched.state && errors?.state) || false}>
          <StateComponent
            value={values.state}
            onChange={(_e: any, value: any) => {
              setFieldValue('state', {
                ...(value || {}),
                name: value?.name,
                isoCode: value?.isoCode,
              });
              setFieldValue('city', { name: '' });
            }}
            error={touched.state && Boolean((errors.state as any)?.name)}
            helperText={touched.state && (errors.state as any)?.name}
            countryValue={values.country}
            textFieldProps={{ label: 'State' }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={4}>
        <ShakingTextField error={!!(touched.city && errors.city) || false}>
          <CityComponent
            value={values.city}
            onChange={(_e: any, value: any) => {
              setFieldValue('city', { name: value?.name });
            }}
            error={touched.city && Boolean((errors.city as any)?.name)}
            helperText={touched.city && (errors.city as any)?.name}
            stateValue={values.state}
            textFieldProps={{ label: 'City' }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={4}>
        <ShakingTextField error={!!(touched.pinCode && errors.pinCode) || false}>
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
    </CollapsibleFormSection>
  );
};
