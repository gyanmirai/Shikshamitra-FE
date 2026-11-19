import CustomSelect from 'src/components/custom-select';
import { Box, Stack, TextField, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { IDENTITY_CARD_PREFIX_LIMIT } from './types';

import type { IdentityCardElement, IdentityCardFieldOption } from './types';

const SCHOOL_FIELDS = [
  { key: 'schoolName', label: 'School name', group: 'Contact/School' },
  { key: 'schoolAddress', label: 'School address', group: 'Contact/School' },
];

export function ElementDataSource({
  element,
  fields,
  fieldPickerLabel = 'Select field',
  onChange,
  disabled,
}: {
  element: IdentityCardElement;
  fields: IdentityCardFieldOption[];
  fieldPickerLabel?: string;
  onChange: (element: IdentityCardElement) => void;
  disabled?: boolean;
}) {
  const dynamic = Boolean(element.fieldKey && element.fieldKey !== 'static');
  const options = [
    ...fields.filter((field) => field.key !== 'static'),
    ...SCHOOL_FIELDS.filter((field) => !fields.some((item) => item.key === field.key)),
  ].map((field) => ({ ...field, group: field.group ?? 'Card Fields' }));
  const defaultField = options.find((field) => field.key !== 'photo')?.key;
  const value = dynamic ? (element.fieldKey ?? '') : '';
  const pickerOptions =
    options.some((field) => field.key === value) || !value
      ? options
      : [{ key: value, label: 'Unavailable field', group: 'Card Fields' }, ...options];
  const prefix =
    element.prefix ??
    (element.style?.showLabel && element.label
      ? `${element.label}${element.style.separator ?? ': '}`
      : '');

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography component="h3" variant="subtitle2">
          Data Source
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Content Type
        </Typography>
        <ToggleButtonGroup
          aria-label="Content Type"
          exclusive
          fullWidth
          size="small"
          value={dynamic ? 'dynamic' : 'static'}
          disabled={disabled}
          onChange={(_, mode: 'static' | 'dynamic' | null) => {
            if (mode)
              onChange({ ...element, fieldKey: mode === 'static' ? 'static' : defaultField });
          }}
        >
          <ToggleButton value="static">Static Text</ToggleButton>
          <ToggleButton value="dynamic">Dynamic Field</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {dynamic ? (
        <>
          <CustomSelect<'key' | 'label' | 'group', false>
            label={fieldPickerLabel}
            name="element-field"
            valueKey="key"
            labelKey="label"
            groupKey="group"
            options={pickerOptions}
            value={value}
            onChange={(fieldKey) => onChange({ ...element, fieldKey: String(fieldKey) })}
            disabled={disabled}
            disabledValues={pickerOptions !== options ? [value] : undefined}
            isSearch
            searchPlaceholder="Search fields"
            size="small"
            fullWidth
            helperText={
              ['headerText', 'footerText'].includes(value)
                ? 'This value comes from the card branding settings.'
                : undefined
            }
          />
          <TextField
            label="Custom Text / Prefix"
            name="element-prefix"
            size="small"
            fullWidth
            value={prefix}
            slotProps={{ htmlInput: { maxLength: IDENTITY_CARD_PREFIX_LIMIT } }}
            disabled={disabled}
            onChange={(event) => onChange({ ...element, prefix: event.target.value })}
          />
        </>
      ) : (
        <TextField
          label="Text Value"
          name="element-text"
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={element.value ?? ''}
          slotProps={{ htmlInput: { maxLength: 2000 } }}
          onChange={(event) => onChange({ ...element, value: event.target.value })}
          disabled={disabled}
        />
      )}
    </Stack>
  );
}
