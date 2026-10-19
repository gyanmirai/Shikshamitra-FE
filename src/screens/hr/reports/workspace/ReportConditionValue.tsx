import type { HrReportField, HrReportFilterCondition } from 'src/redux/hr/hrReportsApi';

import { Stack, MenuItem, TextField, Autocomplete } from '@mui/material';

export function ReportConditionValue({
  field,
  condition,
  label = 'Value',
  disabled,
  onChange,
}: {
  field?: HrReportField;
  condition: HrReportFilterCondition;
  label?: string;
  disabled?: boolean;
  onChange: (value: Partial<HrReportFilterCondition>) => void;
}) {
  if (['empty', 'notEmpty'].includes(condition.operator)) return null;
  const type =
    field?.type === 'date'
      ? 'date'
      : field?.type === 'datetime'
        ? 'datetime-local'
        : ['money', 'number'].includes(field?.type || '')
          ? 'number'
          : 'text';
  const timestamp = (value = '') => {
    if (type !== 'datetime-local' || !value) return value;
    const date = new Date(
      value.endsWith('Z') || /[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`
    );
    return Number.isNaN(date.valueOf()) ? value : date.toISOString().slice(0, 16);
  };
  const stored = (value: string) =>
    type === 'datetime-local' && value ? new Date(`${value}Z`).toISOString() : value;
  const caption = field?.type === 'datetime' ? `${label} (UTC)` : label;
  if (['in', 'notIn'].includes(condition.operator))
    return (
      <Autocomplete
        multiple
        freeSolo
        size="small"
        options={field?.options?.map((x) => x.id) || []}
        value={condition.values || []}
        disabled={disabled}
        onChange={(_, values) => onChange({ values })}
        renderInput={(props) => (
          <TextField {...props} label={caption} helperText="Enter each value and press Enter." />
        )}
      />
    );
  if (condition.operator === 'between')
    return (
      <Stack direction="row" spacing={1}>
        {[0, 1].map((index) => (
          <TextField
            key={index}
            size="small"
            fullWidth
            type={type}
            label={`${caption} ${index === 0 ? 'from' : 'to'}`}
            value={timestamp(condition.values?.[index])}
            InputLabelProps={type.startsWith('date') ? { shrink: true } : undefined}
            disabled={disabled}
            onChange={(e) => {
              const values = [...(condition.values || ['', ''])];
              values[index] = stored(e.target.value);
              onChange({ values });
            }}
          />
        ))}
      </Stack>
    );
  if (field?.type === 'boolean' || field?.options?.length)
    return (
      <TextField
        select
        size="small"
        label={caption}
        value={condition.value || ''}
        disabled={disabled}
        onChange={(e) => onChange({ value: e.target.value })}
      >
        {(field?.type === 'boolean'
          ? [
              { id: 'true', label: 'Yes' },
              { id: 'false', label: 'No' },
            ]
          : field?.options || []
        ).map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  return (
    <TextField
      size="small"
      type={type}
      label={caption}
      value={timestamp(condition.value)}
      InputLabelProps={type.startsWith('date') ? { shrink: true } : undefined}
      disabled={disabled}
      onChange={(e) => onChange({ value: stored(e.target.value) })}
    />
  );
}
