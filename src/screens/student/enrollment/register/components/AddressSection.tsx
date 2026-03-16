import React from 'react';
import { Grid, TextField } from '@mui/material';
import { toNumericWithMax } from 'src/utils/input-format';
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';
import {
  SectionCard,
  CardActions,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { SectionProps } from './section-types';

const AddressSection: React.FC<SectionProps> = ({
  formik,
  isMainForm,
  isEdit,
  onSave,
  onCancel,
}) => (
  <SectionCard
    title="Address"
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
        error={(formik.touched as any).addressLine1 && Boolean((formik.errors as any).addressLine1)}
      >
        <TextField
          key="addressLine1"
          size="small"
          label="Building No./Flat/ House No. *"
          name="addressLine1"
          value={(formik.values as any).addressLine1}
          onBlur={formik.handleBlur}
          error={
            (formik.touched as any).addressLine1 && Boolean((formik.errors as any).addressLine1)
          }
          helperText={(formik.touched as any).addressLine1 && (formik.errors as any).addressLine1}
          fullWidth
          onChange={formik.handleChange}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <ShakingTextField
        error={(formik.touched as any).addressLine2 && Boolean((formik.errors as any).addressLine2)}
      >
        <TextField
          key="addressLine2"
          size="small"
          label="Area/Locality/Road Name *"
          name="addressLine2"
          value={(formik.values as any).addressLine2}
          onBlur={formik.handleBlur}
          error={
            (formik.touched as any).addressLine2 && Boolean((formik.errors as any).addressLine2)
          }
          helperText={(formik.touched as any).addressLine2 && (formik.errors as any).addressLine2}
          fullWidth
          onChange={formik.handleChange}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <ShakingTextField
        error={(formik.touched as any).addressLine3 && Boolean((formik.errors as any).addressLine3)}
      >
        <TextField
          key="addressLine3"
          size="small"
          label="Landmark"
          name="addressLine3"
          value={(formik.values as any).addressLine3}
          onBlur={formik.handleBlur}
          error={
            (formik.touched as any).addressLine3 && Boolean((formik.errors as any).addressLine3)
          }
          helperText={(formik.touched as any).addressLine3 && (formik.errors as any).addressLine3}
          fullWidth
          onChange={formik.handleChange}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).country && Boolean((formik.errors as any).country)}
      >
        <CountryComponent
          value={(formik.values as any).country}
          onChange={(_, value) => {
            formik.setFieldValue('state', { name: '', isoCode: '' });
            formik.setFieldValue('country', { name: value?.name, isoCode: value?.isoCode });
          }}
          name="country"
          onBlur={formik.handleBlur as any}
          error={(formik.touched as any).country && Boolean((formik.errors as any)?.country?.name)}
          helperText={(formik.touched as any).country && (formik.errors as any)?.country?.name}
          disabled={!isEdit.value}
          textFieldProps={{ label: 'Country *' }}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).state && Boolean((formik.errors as any).state)}
      >
        <StateComponent
          value={(formik.values as any).state}
          onChange={(_, value) => {
            formik.setFieldValue('state', {
              ...(value || {}),
              name: value?.name,
              isoCode: value?.isoCode,
            });
            formik.setFieldValue('city', { name: '' });
          }}
          onBlur={formik.handleBlur as any}
          countryValue={(formik.values as any).country}
          error={(formik.touched as any).state && Boolean((formik.errors as any)?.state?.name)}
          helperText={(formik.touched as any).state && (formik.errors as any)?.state?.name}
          disabled={!isEdit.value || !(formik.values as any).country}
          textFieldProps={{ label: 'State *' }}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).city && Boolean((formik.errors as any).city)}
      >
        <CityComponent
          value={(formik.values as any).city}
          onChange={(_, value) => {
            formik.setFieldValue('city', { name: value?.name });
          }}
          onBlur={formik.handleBlur as any}
          stateValue={(formik.values as any).state}
          error={(formik.touched as any).city && Boolean((formik.errors as any)?.city?.name)}
          helperText={(formik.touched as any).city && (formik.errors as any)?.city?.name}
          disabled={!isEdit.value || !(formik.values as any).state}
          textFieldProps={{ label: 'City *' }}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).pinCode && Boolean((formik.errors as any).pinCode)}
      >
        <TextField
          key="pinCode"
          size="small"
          label="PIN Code"
          name="pinCode"
          value={(formik.values as any).pinCode}
          onBlur={formik.handleBlur}
          error={(formik.touched as any).pinCode && Boolean((formik.errors as any).pinCode)}
          helperText={(formik.touched as any).pinCode && (formik.errors as any).pinCode}
          fullWidth
          onChange={(e) => {
            formik.setFieldValue('pinCode', toNumericWithMax(e.target.value, 6));
            formik.setFieldTouched('pinCode', true, true);
          }}
          inputProps={{
            maxLength: 6,
            pattern: '[0-9]*',
          }}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>
  </SectionCard>
);

export default AddressSection;
