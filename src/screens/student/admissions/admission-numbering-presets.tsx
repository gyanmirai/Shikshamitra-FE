import { Radio, Stack, RadioGroup, Typography, FormControlLabel } from '@mui/material';

export type NumberingPreset = 'simple' | 'school' | 'academic' | 'custom';

const presets: { value: NumberingPreset; label: string; example: string; description: string }[] = [
  {
    value: 'simple',
    label: 'Simple Number',
    example: '001, 002, 003',
    description: 'Continues across years',
  },
  {
    value: 'school',
    label: 'School Prefix',
    example: 'DDVS-001',
    description: 'Adds your chosen prefix',
  },
  {
    value: 'academic',
    label: 'Academic Year',
    example: '2026-27/001',
    description: 'Restarts each academic year',
  },
  {
    value: 'custom',
    label: 'Custom',
    example: 'Create your own format',
    description: 'Choose your format and cycle',
  },
];

export function AdmissionNumberingPresets({
  value,
  disabled,
  onChange,
}: {
  value: NumberingPreset;
  disabled: boolean;
  onChange: (value: NumberingPreset) => void;
}) {
  return (
    <RadioGroup
      aria-label="Numbering style"
      value={value}
      onChange={(_, selected) => onChange(selected as NumberingPreset)}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 1,
      }}
    >
      {presets.map((preset) => (
        <FormControlLabel
          key={preset.value}
          value={preset.value}
          disabled={disabled}
          control={<Radio size="small" />}
          label={
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2">{preset.label}</Typography>
              <Typography variant="body2">{preset.example}</Typography>
              <Typography variant="caption" color="text.secondary">
                {preset.description}
              </Typography>
            </Stack>
          }
          sx={{
            m: 0,
            minWidth: 0,
            p: 1,
            alignItems: 'flex-start',
            border: 1,
            borderRadius: 1,
            borderColor: value === preset.value ? 'primary.main' : 'divider',
            bgcolor: value === preset.value ? 'action.selected' : undefined,
            '& .MuiFormControlLabel-label': { minWidth: 0, flex: 1 },
          }}
        />
      ))}
    </RadioGroup>
  );
}
