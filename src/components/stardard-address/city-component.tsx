import type { ICity, IState } from 'country-state-city';
import type { TextFieldProps, AutocompleteProps } from '@mui/material';

import React, { useMemo } from 'react';
import { City } from 'country-state-city';

import { TextField, Autocomplete } from '@mui/material';

const CityComponent = ({
  onChange,
  error,
  helperText,
  value,
  stateValue,
  textFieldProps,
  ...filedProps
}: Partial<
  AutocompleteProps<Partial<ICity>, false, false, false> &
    Omit<TextFieldProps, 'onChange'> & {
      stateValue?: Partial<IState>;
    } & {
      textFieldProps?: Partial<TextFieldProps>;
    }
>) => {
  const allCities = useMemo(
    () =>
      stateValue
        ? City.getCitiesOfState(stateValue?.countryCode as string, stateValue?.isoCode as string)
        : [],
    [stateValue]
  );
  return (
    <Autocomplete
      noOptionsText="No City Found"
      fullWidth
      value={value}
      onChange={onChange}
      renderOption={(props, option: any) => (
        <li {...props} key={option.id}>
          {`${option?.name}`}
        </li>
      )}
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
        />
      )}
      label="City"
      {...filedProps}
    />
  );
};

export default CityComponent;
