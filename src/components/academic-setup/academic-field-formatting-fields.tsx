import CustomSelect from 'src/components/custom-select';
import {
  Box,
  Radio,
  Alert,
  Typography,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import {
  formatAcademicName,
  ACADEMIC_CASE_OPTIONS,
  ACADEMIC_FORMAT_FIELDS,
} from './academic-field-formatting-model';

import type { AcademicTextCase, AcademicFieldFormatting } from './academic-field-formatting-model';

type Props<T extends string> = {
  field: T;
  mode: AcademicTextCase;
  disabled: boolean;
  onFieldChange: (value: T) => void;
  onModeChange: (value: AcademicTextCase) => void;
  fields?: readonly {
    key: T;
    label: string;
    example: string;
    fixedDisabled?: boolean;
    explanation?: string;
  }[];
};

export function AcademicFieldFormattingFields<T extends string = keyof AcademicFieldFormatting>({
  field,
  mode,
  disabled,
  onFieldChange,
  onModeChange,
  fields,
}: Props<T>) {
  const available = fields ?? ACADEMIC_FORMAT_FIELDS;
  const selected = available.find((item) => item.key === field)!;
  return (
    <>
      <CustomSelect
        label="Field"
        value={field}
        options={available.map((item) => ({ value: item.key, label: item.label }))}
        onChange={(value) => onFieldChange(value as T)}
        disabled={disabled}
        size="small"
        autoFocus
      />
      {selected.fixedDisabled && <Alert severity="info">{selected.explanation}</Alert>}
      <FormControl component="fieldset" disabled={disabled || selected.fixedDisabled} fullWidth>
        <Typography component="legend" variant="caption" sx={{ mb: 1, fontWeight: 600 }}>
          Text case
        </Typography>
        <RadioGroup
          aria-label="Text case"
          value={mode}
          onChange={(event) => onModeChange(Number(event.target.value) as AcademicTextCase)}
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}
        >
          {ACADEMIC_CASE_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio size="small" />}
              sx={{
                m: 0,
                p: 0.5,
                border: 1,
                borderRadius: 1,
                borderColor: mode === option.value ? 'primary.main' : 'divider',
                bgcolor: mode === option.value ? 'action.selected' : 'background.paper',
                alignItems: 'flex-start',
                minWidth: 0,
              }}
              label={
                <Box sx={{ py: 0.5, overflowWrap: 'anywhere' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {option.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={mode === option.value ? 'text.primary' : 'text.secondary'}
                    display="block"
                  >
                    {formatAcademicName(selected.example, option.value)}
                  </Typography>
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
    </>
  );
}
