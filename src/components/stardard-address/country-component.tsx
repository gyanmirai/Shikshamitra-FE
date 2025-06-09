import React, { useMemo } from 'react';
import { type ICountry } from 'country-state-city';

import { TextField } from '@mui/material';
import { Autocomplete, type TextFieldProps, type AutocompleteProps } from '@mui/material';

import ShakingTextField from '../shaking-text-field';

const CountryComponent = ({
  onChange,
  error,
  helperText,
  value,
  textFieldProps,
  ...filedProp
}: Partial<
  AutocompleteProps<Partial<ICountry>, false, false, false> &
    Omit<TextFieldProps, 'onChange'> & {
      textFieldProps?: Partial<TextFieldProps>;
    }
>) => {
  // const allCountry = useMemo(() => Country.getAllCountries(), []);
  const allCountry = useMemo(
    () => [
      {
        name: 'India',
        isoCode: 'IN',
        flag: '🇮🇳',
        phonecode: '91',
        currency: 'INR',
        latitude: '20.00000000',
        longitude: '77.00000000',
        timezones: [
          {
            zoneName: 'Asia/Kolkata',
            gmtOffset: 19800,
            gmtOffsetName: 'UTC+05:30',
            abbreviation: 'IST',
            tzName: 'Indian Standard Time',
          },
        ],
      },
    ],
    []
  );

  return (
    <ShakingTextField error={error}>
      <Autocomplete
        noOptionsText="No Country Found"
        fullWidth
        value={value}
        onChange={onChange}
        options={allCountry || []}
        getOptionLabel={(option: any) =>
          `${option?.isoCode ? `${option?.isoCode} ` : ''}${option?.name || ''}`
        }
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            placeholder="Search  Country"
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
        label="Country"
        {...filedProp}
      />
    </ShakingTextField>
  );
};

export default CountryComponent;
