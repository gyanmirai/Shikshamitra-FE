import type {
  AdmissionFormFieldType,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import FormControlLabel from '@mui/material/FormControlLabel';

import { PaletteFieldButton } from './palette-field-button';
import { CUSTOM_FIELD_PRESETS } from '../form-field-presets';
import { matchesStudentField } from '../student-field-configuration';
import { fieldTypeIcon, CREATABLE_FIELD_TYPES } from '../form-dialog-model';
import {
  appendPastedAdmissionChoices,
  serializeEditableAdmissionChoices,
} from '../field-choice-options';

import type { AdmissionFieldPreset } from '../form-field-presets';

type Props = {
  systemFields?: AdmissionFormSystemFieldMetadata[];
  usedBindings?: readonly string[];
  onAddField: (
    type: AdmissionFormFieldType,
    binding?: string,
    preset?: AdmissionFieldPreset
  ) => void;
};

export function CustomFieldPalette({ onAddField, systemFields = [], usedBindings = [] }: Props) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<AdmissionFormFieldType>(0);
  const [required, setRequired] = useState(false);
  const [choices, setChoices] = useState('');
  const needsChoices = [6, 7, 8].includes(type);
  const [showTypes, setShowTypes] = useState(false);
  const normalized = label.trim().toLowerCase();
  const suggestions =
    normalized.length >= 3
      ? systemFields
          .filter(
            (field) =>
              matchesStudentField(field, normalized) ||
              normalized.includes(field.displayName.toLowerCase())
          )
          .slice(0, 3)
      : [];
  return (
    <Scrollbar
      fillContent
      aria-label="Custom fields"
      sx={{
        flex: 1,
        minHeight: 0,
        '& .simplebar-content-wrapper': { overflowX: 'hidden !important' },
        '& .simplebar-track.simplebar-horizontal': { display: 'none' },
      }}
    >
      <Stack spacing={1} sx={{ pr: 1, pb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Collect extra information for this admission form.
        </Typography>
        <TextField
          size="small"
          fullWidth
          label="Question"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        {suggestions.length > 0 && (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Existing Student fields
            </Typography>
            {suggestions.map((field) => (
              <PaletteFieldButton
                key={field.key}
                label={field.displayName}
                icon={fieldTypeIcon(field.fieldType)}
                disabled={usedBindings.some((key) => key.toLowerCase() === field.key.toLowerCase())}
                onClick={() => {
                  onAddField(field.fieldType, field.key);
                  setLabel('');
                }}
              />
            ))}
          </Stack>
        )}
        <TextField
          select
          size="small"
          fullWidth
          label="Answer type"
          value={type}
          onChange={(event) => setType(Number(event.target.value) as AdmissionFormFieldType)}
        >
          {CREATABLE_FIELD_TYPES.map(([name, value]) => (
            <MenuItem key={value} value={value}>
              {name}
            </MenuItem>
          ))}
        </TextField>
        {needsChoices && (
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={3}
            label="Choices"
            helperText="Enter one choice per line."
            value={choices}
            onChange={(event) => setChoices(event.target.value)}
          />
        )}
        <FormControlLabel
          control={<Switch checked={required} onChange={(_, value) => setRequired(value)} />}
          label="Required"
        />
        <Button
          variant="contained"
          disabled={!normalized || (needsChoices && !choices.trim())}
          onClick={() => {
            onAddField(type, undefined, {
              label: label.trim(),
              description: '',
              icon: fieldTypeIcon(type),
              fieldType: type,
              validation: {},
              required,
              optionsJson: needsChoices
                ? serializeEditableAdmissionChoices(appendPastedAdmissionChoices([], choices))
                : undefined,
            });
            setLabel('');
            setChoices('');
          }}
        >
          Add custom field
        </Button>
        <Button
          size="small"
          aria-expanded={showTypes}
          onClick={() => setShowTypes((value) => !value)}
        >
          More field formats
        </Button>
        <Collapse in={showTypes}>
          <Stack spacing={1}>
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
            {CREATABLE_FIELD_TYPES.map(([typeLabel, value]) => (
              <PaletteFieldButton
                key={value}
                label={typeLabel}
                icon={fieldTypeIcon(value)}
                onClick={() => onAddField(value)}
              />
            ))}
          </Stack>
        </Collapse>
      </Stack>
    </Scrollbar>
  );
}
