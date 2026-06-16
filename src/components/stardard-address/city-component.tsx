import type { ICity, IState, ICountry } from 'country-state-city';
import type { TextFieldProps, AutocompleteProps } from '@mui/material';

import React, { useMemo } from 'react';
import { City } from 'country-state-city';
import { TextField, Typography, Autocomplete } from '@mui/material';

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
  const allCities = useMemo(
    () =>
      stateValue
        ? City.getCitiesOfState(
            (stateValue?.countryCode || countryValue?.isoCode) as string,
            stateValue?.isoCode as string
          )
        : [],
    [stateValue, countryValue]
  );
  return (
    <Autocomplete
      noOptionsText={<Typography variant="caption">No City Found</Typography>}
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
      disabled={!stateValue?.name}
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
