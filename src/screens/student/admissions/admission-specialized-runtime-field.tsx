'use client';

import type { ICity, IState, ICountry } from 'country-state-city';

import { TextField, InputAdornment } from '@mui/material';
import OtpInputField from 'src/components/otp-input-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import { parseFieldConfiguration } from './form-dialog/form-field-presets';

type Field = {
  code: string;
  label: string;
  fieldType: number;
  required: boolean;
  placeholder?: string | null;
  helpText?: string | null;
  validationJson?: string | null;
};

type Props = {
  field: Field;
  value: string;
  disabled: boolean;
  error?: string;
  formValues: Record<string, string>;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function AdmissionSpecializedRuntimeField({
  field,
  value,
  disabled,
  error,
  formValues,
  onChange,
  onBlur,
}: Props) {
  const configuration = parseFieldConfiguration(field.validationJson);
  const commonProps = {
    error: Boolean(error),
    helperText: error || field.helpText || undefined,
    onBlur,
  };

  if (configuration.format === 'phone' || field.fieldType === 4)
    return (
      <TextField
        {...commonProps}
        fullWidth
        size="small"
        type="tel"
        label={field.label}
        required={field.required}
        disabled={disabled}
        value={readNationalPhone(value)}
        placeholder={field.placeholder ?? undefined}
        slotProps={{
          htmlInput: { inputMode: 'numeric', maxLength: 10 },
          input: { startAdornment: <InputAdornment position="start">+91</InputAdornment> },
        }}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 10))}
      />
    );
  if (configuration.format === 'aadhaar')
    return (
      <OtpInputField
        {...commonProps}
        label={labelWithRequired(field)}
        maxLength={12}
        groupBy={4}
        pattern="^[0-9]*$"
        disabled={disabled}
        value={value}
        onChange={onChange}
        pasteTransformer={(pastedValue) => pastedValue.replace(/\D/g, '').slice(0, 12)}
      />
    );
  if (configuration.format === 'pan')
    return (
      <OtpInputField
        {...commonProps}
        label={labelWithRequired(field)}
        maxLength={10}
        groupBy={5}
        pattern="^[A-Za-z0-9]*$"
        inputMode="text"
        disabled={disabled}
        value={value}
        onChange={(nextValue) => onChange(nextValue.toUpperCase())}
        pasteTransformer={(pastedValue) =>
          pastedValue
            .replace(/[^a-z0-9]/gi, '')
            .toUpperCase()
            .slice(0, 10)
        }
      />
    );
  if (configuration.format === 'pincode')
    return (
      <TextField
        {...commonProps}
        fullWidth
        size="small"
        label={field.label}
        required={field.required}
        disabled={disabled}
        value={value}
        placeholder={field.placeholder ?? undefined}
        slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 6 } }}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
      />
    );
  if (configuration.format === 'country')
    return (
      <CountryComponent
        {...commonProps}
        disabled={disabled}
        value={readLocation<ICountry>(value)}
        onChange={(_, nextValue) => onChange(writeLocation(nextValue))}
        textFieldProps={{ label: field.label, required: field.required, onBlur }}
      />
    );

  const country = readLocation<ICountry>(formValues[configuration.countryField ?? '']);
  if (configuration.format === 'state')
    return (
      <StateComponent
        {...commonProps}
        disabled={disabled || !country?.isoCode}
        countryValue={country}
        value={readLocation<IState>(value)}
        onChange={(_, nextValue) => onChange(writeLocation(nextValue))}
        textFieldProps={{ label: field.label, required: field.required, onBlur }}
      />
    );
  if (configuration.format === 'city') {
    const state = readLocation<IState>(formValues[configuration.stateField ?? '']);
    return (
      <CityComponent
        {...commonProps}
        disabled={disabled || !country?.isoCode || !state?.name}
        countryValue={country}
        stateValue={state}
        value={readLocation<ICity>(value)}
        onChange={(_, nextValue) => onChange(writeLocation(nextValue))}
        textFieldProps={{ label: field.label, required: field.required, onBlur }}
      />
    );
  }
  return null;
}

const labelWithRequired = (field: Field) => `${field.label}${field.required ? ' *' : ''}`;

function readLocation<T>(value?: string): Partial<T> | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as Partial<T>;
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch {
    return { name: value } as unknown as Partial<T>;
  }
}

function writeLocation(value: unknown) {
  return value && typeof value === 'object' ? JSON.stringify(value) : '';
}

function readNationalPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length > 10 && digits.startsWith('91') ? digits.slice(2, 12) : digits.slice(0, 10);
}
