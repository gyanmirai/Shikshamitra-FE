import type { ICity, IState, ICountry } from 'country-state-city';
import type { TextFieldProps, AutocompleteProps } from '@mui/material';

import React, { useMemo } from 'react';
import { City, State } from 'country-state-city';
import { TextField, Typography, Autocomplete } from '@mui/material';

export const resolveCityComponentStateCode = (
  stateValue?: Partial<IState>,
  countryValue?: Partial<ICountry>
) => {
  const countryCode = stateValue?.countryCode || countryValue?.isoCode || '';
  if (!countryCode) {
    return '';
  }

  if (stateValue?.isoCode) {
    return stateValue.isoCode;
  }

  const stateName = stateValue?.name?.trim().toLowerCase();
  if (!stateName) {
    return '';
  }

  return (
    State.getStatesOfCountry(countryCode).find(
      (state) => state.name.trim().toLowerCase() === stateName
    )?.isoCode || ''
  );
};

const CityComponent = ({
  onChange,
  error,
  helperText,
  value,
  stateValue,
  countryValue,
  textFieldProps,
  ...filedProps
}: Partial<
  AutocompleteProps<Partial<ICity>, false, false, false> &
    Omit<TextFieldProps, 'onChange'> & {
      stateValue?: Partial<IState>;
      countryValue?: Partial<ICountry>;
    } & {
      textFieldProps?: Partial<TextFieldProps>;
    }
>) => {
  const countryCode = stateValue?.countryCode || countryValue?.isoCode || '';
  const stateCode = useMemo(
    () => resolveCityComponentStateCode(stateValue, countryValue),
    [countryValue, stateValue]
  );
  const allCities = useMemo(
    () =>
      stateValue?.name && countryCode && stateCode
        ? City.getCitiesOfState(countryCode, stateCode)
        : [],
    [countryCode, stateCode, stateValue?.name]
  );
  return (
    <Autocomplete
      noOptionsText={
        <Typography variant="caption">
          {stateValue?.name ? 'No City Found' : 'Select a state first'}
        </Typography>
      }
      fullWidth
      value={value?.name ? value : null}
      onChange={onChange}
      isOptionEqualToValue={(option, val) => option?.name === val?.name}
      getOptionKey={(option: any) =>
        `${option?.countryCode || ''}-${option?.stateCode || ''}-${option?.name || ''}`
      }
      renderOption={(props, option: any) => {
        const { key, ...optionProps } = props;
        return (
          <li
            key={
              key || `${option?.countryCode || ''}-${option?.stateCode || ''}-${option?.name || ''}`
            }
            {...optionProps}
          >
            {`${option?.name}`}
          </li>
        );
      }}
      disabled={!stateValue?.name || !countryCode || !stateCode}
      options={allCities || []}
      getOptionLabel={(option: any) => `${option?.name || ''}`}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          label="City"
          error={error}
          helperText={helperText}
          {...textFieldProps}
          sx={{
            ...(error && {
              '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                borderColor: 'error.main',
              },
              '& .MuiInputLabel-root.Mui-disabled': {
                color: 'error.main',
              },
            }),
          }}
        />
      )}
      label="City"
      {...filedProps}
    />
  );
};

export default CityComponent;
