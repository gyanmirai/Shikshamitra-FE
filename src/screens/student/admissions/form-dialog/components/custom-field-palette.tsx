import type {
  AdmissionFormFieldType,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import { useId, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import FormControlLabel from '@mui/material/FormControlLabel';

import { PaletteFieldButton } from './palette-field-button';
import { CUSTOM_FIELD_PRESETS } from '../form-field-presets';
import { matchesStudentField } from '../student-field-configuration';
import { findExistingStudentFieldAlias } from '../form-inheritance-model';
import { fieldTypeIcon, CREATABLE_FIELD_TYPES } from '../form-dialog-model';
import { classInterestOptions, isClassInterestQuestion } from '../../admission-class-question';
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
  const [confirmedDifferent, setConfirmedDifferent] = useState<string | null>(null);
  const isClassInterest = isClassInterestQuestion({ code: '', label, bindingType: 1 });
  const answerType = isClassInterest ? 6 : type;
  const needsChoices = !isClassInterest && [6, 7, 8].includes(type);
  const [showTypes, setShowTypes] = useState(false);
  const formatsId = useId();
  const normalized = label.trim().toLowerCase();
  const alias = findExistingStudentFieldAlias(label, systemFields);
  const aliasIncluded = Boolean(
    alias && usedBindings.some((key) => key.toLowerCase() === alias.key.toLowerCase())
  );
  const needsIdentityReview = aliasIncluded && confirmedDifferent !== normalized;
  const suggestions =
    normalized.length >= 3
      ? systemFields
          .filter(
            (field) =>
              field === alias ||
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
      <Stack spacing={1.5} sx={{ pt: 1, pr: 1, pb: 1 }}>
        <TextField
          size="small"
          fullWidth
          label="Question"
          value={label}
          onChange={(event) => {
            setLabel(event.target.value);
            setConfirmedDifferent(null);
          }}
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
        {needsIdentityReview && alias && (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="warning.main">
              {alias.displayName} is already included. Reuse it unless this asks for different
              information.
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button
                size="small"
                variant="outlined"
                onClick={() => onAddField(alias.fieldType, alias.key)}
              >
                Go to existing field
              </Button>
              <Button size="small" onClick={() => setConfirmedDifferent(normalized)}>
                Different question
              </Button>
            </Stack>
          </Stack>
        )}
        <TextField
          select
          size="small"
          fullWidth
          label="Answer type"
          value={answerType}
          disabled={isClassInterest}
          onChange={(event) => setType(Number(event.target.value) as AdmissionFormFieldType)}
        >
          {CREATABLE_FIELD_TYPES.map(([name, value]) => (
            <MenuItem key={value} value={value}>
              {name}
            </MenuItem>
          ))}
        </TextField>
        {isClassInterest && (
          <Typography variant="caption" color="text.secondary">
            Classes come from Institute Setup. An existing class-interest question will be reused.
          </Typography>
        )}
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
          sx={{ m: 0, alignSelf: 'flex-start' }}
          control={
            <Switch size="small" checked={required} onChange={(_, value) => setRequired(value)} />
          }
          label={<Typography variant="body2">Required</Typography>}
        />
        <Button
          fullWidth
          size="small"
          variant="contained"
          startIcon={<Iconify icon="mdi:plus" />}
          disabled={!normalized || needsIdentityReview || (needsChoices && !choices.trim())}
          onClick={() => {
            onAddField(answerType, undefined, {
              label: label.trim(),
              description: '',
              icon: fieldTypeIcon(answerType),
              fieldType: answerType,
              validation: {},
              required,
              optionsJson: isClassInterest
                ? classInterestOptions
                : needsChoices
                  ? serializeEditableAdmissionChoices(appendPastedAdmissionChoices([], choices))
                  : undefined,
            });
            setLabel('');
            setChoices('');
            setConfirmedDifferent(null);
          }}
        >
          Add custom field
        </Button>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          aria-expanded={showTypes}
          aria-controls={formatsId}
          endIcon={<Iconify icon={showTypes ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
          sx={{ justifyContent: 'space-between' }}
          onClick={() => setShowTypes((value) => !value)}
        >
          More field formats
        </Button>
        <Collapse id={formatsId} in={showTypes}>
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
