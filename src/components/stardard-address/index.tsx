import type { ICity, IState, ICountry } from 'country-state-city';
import type { TextFieldProps, AutocompleteProps } from '@mui/material';

import { City, State, Country } from 'country-state-city';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { TextField, Autocomplete } from '@mui/material';

import CustomSelect from '../custom-select';

import type { CustomSelectProps } from '../custom-select';

class StandardAddress {
  static RenderAddressField = (filedProps: TextFieldProps): JSX.Element => (
    <TextField {...filedProps} />
  );

  static RenderCountry = <T extends string, J extends boolean>(
    filedProps: CustomSelectProps<T, J>
  ): JSX.Element => <CustomSelect label="Country" {...filedProps} />;

  static RenderState = <T extends string, J extends boolean>(
    filedProps: CustomSelectProps<T, J>
  ): JSX.Element => <CustomSelect label="State" {...filedProps} />;

  static RenderCity = <T extends string, J extends boolean>(
    filedProps: CustomSelectProps<T, J>
  ): JSX.Element => <CustomSelect label="City" {...filedProps} />;

  static RenderPincode = (filedProps: TextFieldProps): JSX.Element => (
    <TextField label="Pincode" {...filedProps} />
  );
}
export default StandardAddress;

interface UseStandardAddress {
  country?: ICountry;
  state?: IState;
  city?: ICity;
  pinCode?: number;
  address?: string;
}

export const useStandardAddress = ({
  country,
  state,
  city,
  pinCode,
  address,
}: UseStandardAddress = {}) => {
  const [countryValue, setCountryValue] = useState<ICountry | null>(null);
  const [stateValue, setStateValue] = useState<IState | null>(null);
  const [cityValue, setCityValue] = useState<ICity | null>(null);
  const [pinCodeValue, setPinCodeValue] = useState<null | number | undefined>(null);
  const [addressValue, setAddressValue] = useState<null | string | undefined>(null);

  useEffect(() => {
    if (country) {
      setCountryValue(country);
    }
    if (state) {
      setStateValue(state);
    }
    if (city) {
      setCityValue(city);
    }
    if (pinCode) {
      setPinCodeValue(pinCode);
    }
    if (address) {
      setAddressValue(address);
    }
  }, [address, city, country, pinCode, state]);

  const allCountry = useMemo(() => Country.getAllCountries(), []);

  const allState = useMemo(
    () => State.getStatesOfCountry(countryValue?.isoCode) || [],
    [countryValue?.isoCode]
  );
  const allCities = useMemo(
    () => (stateValue ? City.getCitiesOfState(stateValue?.countryCode, stateValue?.isoCode) : []),
    [stateValue]
  );

  const RenderCountry = useCallback(
    ({ onChange, ...filedProp }: Partial<AutocompleteProps<ICountry, false, false, false>>) => (
      <Autocomplete
        // loading={isLoading}
        noOptionsText="No Country Found"
        fullWidth
        value={countryValue}
        onChange={(e, value, ...rest) => {
          setStateValue(null);
          setCityValue(null);
          setCountryValue(value as ICountry);
          onChange?.(e, value, ...rest);
        }}
        options={allCountry || []}
        getOptionLabel={(option: any) => `${option?.isoCode} ${option?.name}`}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            label="Country"
            placeholder="Search  Country"
          />
        )}
        renderOption={(props, option: any) => (
          <li {...props} key={option.id}>
            {`${option?.isoCode} ${option?.name}`}
          </li>
        )}
        {...filedProp}
      />
    ),
    [allCountry, countryValue]
  );

  const RenderState = useCallback(
    ({
      onChange,
      ...filedProps
    }: Partial<AutocompleteProps<IState | undefined, false, false, false>>) => (
      <Autocomplete
        // loading={isLoading}
        noOptionsText="No State Found"
        fullWidth
        value={stateValue}
        onChange={(e, value) => {
          setCityValue(null);
          setStateValue(value as IState);
        }}
        options={allState || []}
        getOptionLabel={(option: any) => `${option?.isoCode} ${option?.name}`}
        renderInput={(params) => (
          <TextField {...params} fullWidth size="small" label="State" placeholder="Search  State" />
        )}
        renderOption={(props, option: any) => (
          <li {...props} key={option.id}>
            {`${option?.isoCode} ${option?.name}`}
          </li>
        )}
        disabled={!countryValue}
        {...filedProps}
      />
    ),
    [allState, countryValue, stateValue]
  );

  const RenderCity = useCallback(
    ({
      onChange,
      renderInput = () => null,
      ...filedProps
    }: Partial<AutocompleteProps<ICity | undefined, false, false, false>>) => (
      <Autocomplete
        // loading={isLoading}
        noOptionsText="No City Found"
        fullWidth
        value={cityValue}
        onChange={(e, value, ...rest) => {
          setCityValue(value as ICity);
          onChange?.(e, value, ...rest);
        }}
        renderOption={(props, option: any) => (
          <li {...props} key={option.id}>
            {`${option?.name}`}
          </li>
        )}
        disabled={!stateValue}
        options={allCities || []}
        getOptionLabel={(option: any) => `${option?.name}`}
        renderInput={(params) => (
          <TextField {...params} fullWidth size="small" label="City" placeholder="Search  City" />
        )}
        {...filedProps}
      />
    ),
    [allCities, cityValue, stateValue]
  );

  const RenderPincode = (filedProps: TextFieldProps) => (
    <TextField
      label="Pincode"
      value={pinCodeValue}
      type="number"
      fullWidth
      onChange={(e) => setPinCodeValue(+e.target.value)}
      {...filedProps}
    />
  );

  const RenderAddressField = (filedProps: TextFieldProps) => (
    <TextField
      value={addressValue}
      fullWidth
      onChange={(e) => setAddressValue(e.target.value)}
      {...filedProps}
    />
  );

  return {
    countryValue,
    stateValue,
    cityValue,
    pinCodeValue,
    addressValue,
    RenderCountry,
    RenderState,
    RenderCity,
    RenderPincode,
    RenderAddressField,
  };
};
