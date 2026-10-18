import type { AdmissionFormFieldType } from 'src/redux/student/admissions/admission-forms-api';

export type AdmissionFieldFormat =
  'email' | 'phone' | 'aadhaar' | 'pan' | 'pincode' | 'country' | 'state' | 'city' | 'photo';

export type AdmissionFieldConfiguration = {
  format?: AdmissionFieldFormat;
  countryField?: string;
  stateField?: string;
  minLength?: number;
  maxLength?: number;
  regex?: string;
  phone?: boolean;
  messages?: Record<string, string>;
};

export type AdmissionFieldPreset = {
  key?: AdmissionFieldFormat;
  label: string;
  description: string;
  icon: string;
  fieldType: AdmissionFormFieldType;
  placeholder?: string;
  validation: AdmissionFieldConfiguration;
  required?: boolean;
  optionsJson?: string;
};

export const CUSTOM_FIELD_PRESETS: AdmissionFieldPreset[] = [
  {
    key: 'phone',
    label: 'Phone number',
    description: 'India mobile number with +91',
    icon: 'mdi:phone-outline',
    fieldType: 4,
    validation: { format: 'phone', phone: true },
  },
  {
    key: 'aadhaar',
    label: 'Aadhaar number',
    description: '12-digit grouped identity number',
    icon: 'mdi:card-account-details-outline',
    fieldType: 0,
    validation: {
      format: 'aadhaar',
      minLength: 12,
      maxLength: 12,
      regex: '^[2-9][0-9]{11}$',
      messages: { regex: 'Enter a valid 12-digit Aadhaar number.' },
    },
  },
  {
    key: 'pan',
    label: 'PAN number',
    description: '10-character tax identity number',
    icon: 'mdi:identifier',
    fieldType: 0,
    validation: {
      format: 'pan',
      minLength: 10,
      maxLength: 10,
      regex: '^[A-Z]{5}[0-9]{4}[A-Z]$',
      messages: { regex: 'Enter a valid PAN number.' },
    },
  },
  {
    key: 'pincode',
    label: 'PIN code',
    description: '6-digit Indian postal code',
    icon: 'mdi:map-marker-radius-outline',
    fieldType: 0,
    placeholder: 'Enter 6-digit PIN code',
    validation: {
      format: 'pincode',
      minLength: 6,
      maxLength: 6,
      regex: '^[0-9]{6}$',
      messages: { regex: 'Enter a valid 6-digit PIN code.' },
    },
  },
  {
    key: 'country',
    label: 'Country',
    description: 'Country selector',
    icon: 'mdi:earth',
    fieldType: 0,
    validation: { format: 'country' },
  },
  {
    key: 'state',
    label: 'State',
    description: 'State selector linked to a country',
    icon: 'mdi:map-outline',
    fieldType: 0,
    validation: { format: 'state' },
  },
  {
    key: 'city',
    label: 'City',
    description: 'City selector linked to a state',
    icon: 'mdi:city-variant-outline',
    fieldType: 0,
    validation: { format: 'city' },
  },
];

export function parseFieldConfiguration(value?: string | null): AdmissionFieldConfiguration {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as AdmissionFieldConfiguration;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export const writeFieldConfiguration = (configuration: AdmissionFieldConfiguration) =>
  JSON.stringify(configuration);
