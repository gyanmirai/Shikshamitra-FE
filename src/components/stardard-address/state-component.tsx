import type { IState, ICountry } from 'country-state-city';
import type { TextFieldProps, AutocompleteProps } from '@mui/material';

import React, { useMemo } from 'react';
import { State } from 'country-state-city';
import { TextField, Typography, Autocomplete } from '@mui/material';

const StateComponent = ({
  onChange,
  error,
  helperText,
  value,
  countryValue,
  textFieldProps = {},
  ...filedProps
}: Partial<
  AutocompleteProps<Partial<IState>, false, false, false> &
    Omit<TextFieldProps, 'onChange'> & {
      countryValue?: Partial<ICountry>;
    } & {
      textFieldProps?: Partial<TextFieldProps>;
    }
>) => {
  const allState = useMemo(
    () => State.getStatesOfCountry(countryValue?.isoCode) || [],
    [countryValue?.isoCode]
  );
  return (
    <Autocomplete
      noOptionsText={<Typography variant="caption">No State Found</Typography>}
      fullWidth
      value={value}
      onChange={onChange}
      options={allState || []}
      getOptionLabel={(option: any) =>
        `${option?.isoCode ? `${option?.isoCode} ` : ''}${option?.name || ''}`
      }
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          label="State"
          error={error}
          helperText={helperText}
          {...textFieldProps}
        />
      )}
      renderOption={(props, option: any) => (
        <li {...props} key={option.id}>
          {`${option?.isoCode} ${option?.name}`}
        </li>
      )}
      disabled={!countryValue?.name}
      label="State"
      {...filedProps}
    />
  );
};

export default StateComponent;
