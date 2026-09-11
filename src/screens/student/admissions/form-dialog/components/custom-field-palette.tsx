import type { AdmissionFormFieldType } from 'src/redux/student/admissions/admission-forms-api';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { PaletteFieldButton } from './palette-field-button';
import { CUSTOM_FIELD_PRESETS } from '../form-field-presets';
import { FIELD_TYPES, fieldTypeIcon } from '../form-dialog-model';

import type { AdmissionFieldPreset } from '../form-field-presets';

type Props = {
  onAddField: (
    type: AdmissionFormFieldType,
    binding?: string,
    preset?: AdmissionFieldPreset
  ) => void;
};

export function CustomFieldPalette({ onAddField }: Props) {
  return (
    <Stack spacing={1} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        Collect extra information for this admission form.
      </Typography>
      <Typography variant="overline" color="text.secondary">
        Ready to use
      </Typography>
      {CUSTOM_FIELD_PRESETS.map((preset) => (
        <PaletteFieldButton
          key={preset.key}
          label={preset.label}
          description={preset.description}
          icon={preset.icon}
          onClick={() => onAddField(preset.fieldType, undefined, preset)}
        />
      ))}
      <Typography variant="overline" color="text.secondary" sx={{ pt: 1 }}>
        Basic field types
      </Typography>
      {FIELD_TYPES.map(([label, value]) => (
        <PaletteFieldButton
          key={value}
          label={label}
          icon={fieldTypeIcon(value)}
          onClick={() => onAddField(value)}
        />
      ))}
    </Stack>
  );
}
