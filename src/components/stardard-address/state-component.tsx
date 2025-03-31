import type { IState, ICountry } from 'country-state-city';
import type { TextFieldProps, AutocompleteProps } from '@mui/material';

import React, { useMemo } from 'react';
import { State } from 'country-state-city';

import { TextField, Autocomplete } from '@mui/material';

const StateComponent = ({
  onChange,
  error,
  helperText,
  value,
  countryValue,
  ...filedProps
}: Partial<
  AutocompleteProps<Partial<IState>, false, false, false> &
    Omit<TextFieldProps, 'onChange'> & {
      countryValue?: Partial<ICountry>;
    }
>) => {
  const allState = useMemo(
    () => State.getStatesOfCountry(countryValue?.isoCode) || [],
    [countryValue?.isoCode]
  );
  return (
    <Autocomplete
      noOptionsText="No State Found"
      fullWidth
      value={value}
      onChange={onChange}
      options={allState || []}
      getOptionLabel={(option: any) => `${option?.isoCode || ''} ${option?.name}`}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          label="State"
          placeholder="Search  State"
          error={error}
          helperText={helperText}
        />
      )}
      renderOption={(props, option: any) => (
        <li {...props} key={option.id}>
          {`${option?.isoCode} ${option?.name}`}
        </li>
      )}
      disabled={!countryValue}
      {...filedProps}
    />
  );
};

export default StateComponent;
