import React, { useMemo } from 'react';
import { Country, type ICountry } from 'country-state-city';

import { TextField } from '@mui/material';
import { Autocomplete, type TextFieldProps, type AutocompleteProps } from '@mui/material';

const CountryComponent = ({
  onChange,
  error,
  helperText,
  value,
  ...filedProp
}: Partial<
  AutocompleteProps<Partial<ICountry>, false, false, false> & Omit<TextFieldProps, 'onChange'>
>) => {
  const allCountry = useMemo(() => Country.getAllCountries(), []);
  return (
    <Autocomplete
      noOptionsText="No Country Found"
      fullWidth
      value={value}
      onChange={onChange}
      options={allCountry || []}
      getOptionLabel={(option: any) => `${option?.isoCode} ${option?.name}`}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          label="Country"
          placeholder="Search  Country"
          error={error}
          helperText={helperText}
        />
      )}
      renderOption={(props, option: any) => (
        <li {...props} key={option.id}>
          {`${option?.isoCode} ${option?.name}`}
        </li>
      )}
      {...filedProp}
    />
  );
};

export default CountryComponent;
