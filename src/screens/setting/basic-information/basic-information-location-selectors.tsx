import type { FormikProps } from 'formik';

import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import type { IFormValues } from '../type';

function locationError(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'name' in value && typeof value.name === 'string')
    return value.name;
  return undefined;
}

export function BasicInformationLocationSelectors({
  formik,
}: {
  formik: FormikProps<IFormValues>;
}) {
  const { values, errors, touched, setFieldValue } = formik;
  const countryError = touched.country ? locationError(errors.country) : undefined;
  const stateError = touched.stateProvince ? locationError(errors.stateProvince) : undefined;
  const cityError = touched.city ? locationError(errors.city) : undefined;
  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={Boolean(countryError)}>
          <CountryComponent
            size="medium"
            value={values.country ?? undefined}
            onChange={(_event, value) => {
              setFieldValue('stateProvince', null);
              setFieldValue('city', null);
              setFieldValue('country', value);
            }}
            error={Boolean(countryError)}
            helperText={countryError}
            textFieldProps={{ label: 'Country *', size: 'medium' }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={Boolean(stateError)}>
          <StateComponent
            value={values.stateProvince ?? undefined}
            countryValue={values.country ?? undefined}
            onChange={(_event, value) => {
              setFieldValue('city', null);
              setFieldValue('stateProvince', value);
            }}
            error={Boolean(stateError)}
            helperText={stateError}
            textFieldProps={{ label: 'State *', size: 'medium' }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={Boolean(cityError)}>
          <CityComponent
            value={values.city ?? undefined}
            stateValue={values.stateProvince ?? undefined}
            countryValue={values.country ?? undefined}
            onChange={(_event, value) => setFieldValue('city', value)}
            error={Boolean(cityError)}
            helperText={cityError}
            textFieldProps={{ label: 'City *', size: 'medium' }}
          />
        </ShakingTextField>
      </Grid>
    </>
  );
}
