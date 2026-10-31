'use client';

import type { ReactNode } from 'react';
import type {
  AdmissionFormOption,
  AdmissionFormOptionsQuery,
  AdmissionFormInheritedOrigin,
} from 'src/redux/student/admissions/admission-forms-api';

import dayjs from 'dayjs';
import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { normalizeEmail } from 'src/utils/input-format';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';
import { Box, Grid, Checkbox, TextField, FormHelperText, FormControlLabel } from '@mui/material';

import { ADMISSION_DATE_FORMAT } from './admission-date-formats';
import { isAdmissionEmailField } from './admission-email-values';
import { AdmissionBoardClassField } from './admission-board-class-field';
import { parseFieldConfiguration } from './form-dialog/form-field-presets';
import { AdmissionProfilePhotoField } from './admission-profile-photo-field';
import { AdmissionMasterDataRuntimeField } from './admission-master-data-runtime-field';
import { AdmissionSpecializedRuntimeField } from './admission-specialized-runtime-field';
import {
  isAdmissionSiblingField,
  AdmissionSiblingRuntimeField,
} from './admission-sibling-runtime-field';
import {
  academicOptionsJson,
  hasBoardClassOptions,
  readBoardClassOptions,
  isInstituteAcademicSource,
} from './admission-academic-options';

type Field = {
  code: string;
  label: string;
  bindingKey?: string | null;
  fieldType: number;
  required: boolean;
  readOnly: boolean;
  placeholder?: string | null;
  helpText?: string | null;
  helpTextDetails?: string;
  optionsJson?: string | null;
  validationJson?: string | null;
  inheritedFrom?: AdmissionFormInheritedOrigin | null;
};
export type AdmissionRuntimeFieldProps = {
  field: Field;
  value: string;
  disabled: boolean;
  error?: string;
  formValues?: Record<string, string>;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onBusyChange?: (busy: boolean) => void;
  loadSiblingOptions?: (input: AdmissionFormOptionsQuery) => Promise<AdmissionFormOption[]>;
  academicYearId?: string;
  academicMediumId?: string;
  optionsResolved?: boolean;
};
type ChoiceOption = { value: string; label: string };
type RendererProps = AdmissionRuntimeFieldProps & { options: ChoiceOption[]; helperId: string };
type FieldRenderer = (props: RendererProps) => ReactNode;

/** Central registry for runtime field renderers. */
const fieldRendererRegistry: Partial<Record<number, FieldRenderer>> = {
  5: renderDate,
  9: renderCheckbox,
  10: renderFilePlaceholder,
  11: renderAddressGroup,
  12: renderStatic,
};

const GENDER_OPTIONS: ChoiceOption[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

export default function AdmissionRuntimeField(props: AdmissionRuntimeFieldProps) {
  const helperId = useId();
  const { field, formValues, optionsResolved } = props;
  const { format } = parseFieldConfiguration(field.validationJson);
  if (isAdmissionSiblingField(field)) return <AdmissionSiblingRuntimeField {...props} />;
  const resolvedClasses =
    optionsResolved && hasBoardClassOptions(field) ? readBoardClassOptions(field.optionsJson) : [];
  if (resolvedClasses.length)
    return <AdmissionBoardClassField {...props} options={resolvedClasses} />;
  if (
    !optionsResolved &&
    [6, 7, 8].includes(field.fieldType) &&
    isInstituteAcademicSource(academicOptionsJson(field))
  )
    return <AdmissionMasterDataRuntimeField {...props} />;
  if (format === 'photo') return <AdmissionProfilePhotoField {...props} />;
  if ((format && format !== 'email') || field.fieldType === 4) {
    return <AdmissionSpecializedRuntimeField {...props} formValues={formValues ?? {}} />;
  }
  const renderer = fieldRendererRegistry[field.fieldType] ?? renderInput;
  return renderer({
    ...props,
    helperId,
    options:
      field.bindingKey === 'Applicant.Gender' || field.code === 'Gender'
        ? GENDER_OPTIONS
        : readOptions(field.optionsJson),
  });
}

function renderStatic({ field, value }: RendererProps) {
  return (
    <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
      {field.label || value}
    </Box>
  );
}
function renderCheckbox({ field, value, disabled, onChange, onBlur }: RendererProps) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={value === 'true'}
          disabled={disabled}
          onBlur={onBlur}
          onChange={(event) => onChange(String(event.target.checked))}
        />
      }
      label={`${field.label}${field.required ? ' *' : ''}`}
    />
  );
}
function renderFilePlaceholder({ field, disabled, error, onBlur }: RendererProps) {
  return (
    <ShakingTextField error={Boolean(error)}>
      <TextField
        fullWidth
        size="small"
        label={field.label}
        required={field.required}
        value=""
        disabled={disabled}
        onBlur={onBlur}
        error={Boolean(error)}
        helperText={error || 'File upload will be enabled in a future phase.'}
      />
    </ShakingTextField>
  );
}

function renderAddressGroup({
  field,
  value,
  disabled,
  error,
  onChange,
  onBlur,
  helperId,
}: RendererProps) {
  const address = readAddress(value);
  return (
    <Box data-form-field-control>
      <TypographyLabel label={field.label} required={field.required} />
      <Grid container spacing={1}>
        {ADDRESS_KEYS.map((key) => (
          <Grid
            key={key}
            size={{ xs: 12, sm: key === 'addressLine1' || key === 'addressLine2' ? 12 : 6 }}
          >
            <TextField
              fullWidth
              size="small"
              label={addressLabel(key)}
              value={address[key]}
              disabled={disabled}
              onBlur={onBlur}
              error={Boolean(error)}
              inputProps={{ 'aria-describedby': error || field.helpText ? helperId : undefined }}
              placeholder={key === 'addressLine1' ? (field.placeholder ?? undefined) : undefined}
              onChange={(event) => onChange(writeAddress(value, key, event.target.value))}
            />
          </Grid>
        ))}
      </Grid>
      {(error || field.helpText) && (
        <FormHelperText id={helperId} error={Boolean(error)}>
          {error || field.helpText}
        </FormHelperText>
      )}
    </Box>
  );
}

function renderDate({ field, value, disabled, error, onChange, onBlur }: RendererProps) {
  const parsedDate = value ? dayjs(value) : null;
  return (
    <ShakingTextField error={Boolean(error)}>
      <DatePicker
        label={field.label}
        format={ADMISSION_DATE_FORMAT}
        value={parsedDate?.isValid() ? parsedDate : null}
        disabled={disabled}
        onChange={(nextValue) => onChange(datePickerToDateTimeOffset(nextValue) ?? '')}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
            required: field.required,
            error: Boolean(error),
            helperText: error || renderFieldHelp(field),
            placeholder: field.placeholder ?? undefined,
            onBlur,
          },
        }}
      />
    </ShakingTextField>
  );
}

function renderFieldHelp(field: Field) {
  if (!field.helpTextDetails) return field.helpText || undefined;
  return (
    <CustomTooltip title={field.helpTextDetails} describeChild arrow>
      <Box
        component="span"
        tabIndex={0}
        aria-label={`${field.label} information`}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, maxWidth: 1 }}
      >
        <span>{field.helpText}</span>
        <Iconify icon={GlobalIcons.info} width={14} sx={{ flexShrink: 0 }} aria-hidden />
      </Box>
    </CustomTooltip>
  );
}

function renderInput({ field, value, disabled, error, onChange, options, onBlur }: RendererProps) {
  const isEmail = isAdmissionEmailField(field);
  const isChoice = field.fieldType === 6 || field.fieldType === 8;
  const isMultiSelect = field.fieldType === 7;
  const selectedValues = isMultiSelect ? parseMultiValue(value) : [];

  if (isChoice || isMultiSelect) {
    return (
      <ShakingTextField error={Boolean(error)}>
        <CustomSelect
          options={options}
          label={field.label}
          required={field.required}
          multiple={isMultiSelect}
          value={isMultiSelect ? selectedValues : value}
          disabled={disabled}
          error={Boolean(error)}
          helperText={error || field.helpText || undefined}
          onBlur={onBlur}
          onChange={(nextValue) =>
            onChange(isMultiSelect ? JSON.stringify(nextValue) : String(nextValue ?? ''))
          }
        />
      </ShakingTextField>
    );
  }

  return (
    <ShakingTextField error={Boolean(error)}>
      <TextField
        fullWidth
        size="small"
        multiline={field.fieldType === 1}
        minRows={field.fieldType === 1 ? 3 : undefined}
        type={
          field.fieldType === 2
            ? 'number'
            : isEmail
              ? 'email'
              : field.fieldType === 4
                ? 'tel'
                : 'text'
        }
        label={field.label}
        required={field.required}
        disabled={disabled}
        error={Boolean(error)}
        helperText={error || field.helpText || undefined}
        placeholder={field.placeholder ?? undefined}
        value={isEmail ? normalizeEmail(value) : value}
        inputProps={
          isEmail ? { autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false } : undefined
        }
        onBlur={onBlur}
        onChange={(event) =>
          onChange(isEmail ? normalizeEmail(event.target.value) : event.target.value)
        }
      />
    </ShakingTextField>
  );
}

function TypographyLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <Box sx={{ typography: 'body2', mb: 0.75, fontWeight: 500 }}>
      {label}
      {required ? ' *' : ''}
    </Box>
  );
}
function readOptions(optionsJson?: string | null): ChoiceOption[] {
  if (!optionsJson) return [];
  try {
    const parsed = JSON.parse(optionsJson) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((option): ChoiceOption[] => {
      const candidate = typeof option === 'string' ? { value: option, label: option } : option;
      if (!candidate || typeof candidate !== 'object' || !('value' in candidate)) return [];
      const rawValue: unknown = candidate.value;
      if (typeof rawValue !== 'string' && typeof rawValue !== 'number') return [];
      if (typeof rawValue === 'number' && !Number.isFinite(rawValue)) return [];
      const value = String(rawValue);
      if (!value.trim()) return [];
      const label =
        'label' in candidate && candidate.label != null ? String(candidate.label) : value;
      return [{ value, label }];
    });
  } catch {
    return [];
  }
}
function parseMultiValue(value: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [value];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

const ADDRESS_KEYS = [
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'country',
  'postalCode',
] as const;
type AddressKey = (typeof ADDRESS_KEYS)[number];
const emptyAddress = (): Record<AddressKey, string> => ({
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
});
function readAddress(value: string): Record<AddressKey, string> {
  try {
    const parsed = JSON.parse(value) as Partial<Record<AddressKey, unknown>>;
    return {
      ...emptyAddress(),
      ...Object.fromEntries(ADDRESS_KEYS.map((key) => [key, String(parsed[key] ?? '')])),
    } as Record<AddressKey, string>;
  } catch {
    return emptyAddress();
  }
}
function writeAddress(value: string, key: AddressKey, nextValue: string) {
  return JSON.stringify({ ...readAddress(value), [key]: nextValue });
}
function addressLabel(key: AddressKey) {
  return {
    addressLine1: 'Address line 1',
    addressLine2: 'Address line 2',
    city: 'City',
    state: 'State',
    country: 'Country',
    postalCode: 'Postal code',
  }[key];
}
