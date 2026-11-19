import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Box,
  Stack,
  TextField,
  ButtonBase,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { readStudentICardLayout } from '../student-icard-json';
import { createStudentICardTemplate, setStudentICardOrientation } from '../student-icard-design';

const presets = [
  {
    key: 'classic-identity',
    label: 'Classic Identity',
    description: 'Configurable front and back with exact print dimensions.',
    color: '#007867',
  },
  {
    key: 'formal-student',
    label: 'Formal Student',
    description: 'Classic school identity card.',
    color: '#1D4ED8',
  },
  {
    key: 'modern-student',
    label: 'Modern Student',
    description: 'Clean badge with a strong accent.',
    color: '#0F766E',
  },
  {
    key: 'vertical-badge',
    label: 'Vertical Badge',
    description: 'Portrait layout for holders.',
    color: '#7C3AED',
  },
  {
    key: 'visitor-style',
    label: 'Visitor Style',
    description: 'High contrast card with compact details.',
    color: '#B45309',
  },
  { key: 'minimal', label: 'Minimal', description: 'Simple, low-ink layout.', color: '#334155' },
  {
    key: 'photo-first',
    label: 'Photo First',
    description: 'Prominent student photo.',
    color: '#BE123C',
  },
] as const;
const orientations = ['Horizontal', 'Vertical'] as const;

type Props = {
  template: IdCardTemplate;
  nameError: boolean;
  onNameBlur: () => void;
  onChange: (patch: Partial<IdCardTemplate>) => void;
};

export function StudentICardTemplateStep({ template, nameError, onNameBlur, onChange }: Props) {
  const selectPreset = (preset: (typeof presets)[number]) => {
    if (preset.key === 'classic-identity') {
      onChange({
        ...createStudentICardTemplate(),
        name: template.name,
        schoolName: template.schoolName,
        schoolAddress: template.schoolAddress,
        headerText: template.headerText,
        footerText: template.footerText,
        logo: template.logo,
      });
      return;
    }
    onChange({
      presetKey: preset.key,
      primaryColor: preset.color,
      orientation: preset.key === 'vertical-badge' ? 'Vertical' : 'Horizontal',
      schemaVersion: 1,
      layoutJson: null,
      printSettingsJson: null,
      backSideEnabled: false,
    });
  };

  return (
    <Stack spacing={2}>
      <Box
        role="group"
        aria-label="Card templates"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
          gridAutoRows: { sm: '1fr' },
          gap: 1.25,
        }}
      >
        {presets.map((preset) => {
          const active = template.presetKey === preset.key;
          return (
            <ButtonBase
              key={preset.key}
              type="button"
              aria-pressed={active}
              onClick={() => selectPreset(preset)}
              sx={{
                gridColumn: preset.key === 'classic-identity' ? '1 / -1' : undefined,
                justifyContent: 'flex-start',
                gap: 1.25,
                p: 1.5,
                minHeight: 64,
                textAlign: 'left',
                border: 1,
                borderRadius: 1,
                borderColor: active ? 'primary.main' : 'divider',
                bgcolor: active ? 'action.selected' : 'background.paper',
                '&:hover': { bgcolor: active ? 'action.selected' : 'action.hover' },
                '&.Mui-focusVisible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
              }}
            >
              <Box
                component="span"
                aria-hidden
                sx={{
                  width: 32,
                  height: 22,
                  borderRadius: 0.75,
                  bgcolor: preset.color,
                  flexShrink: 0,
                }}
              />
              <Box component="span" sx={{ minWidth: 0, flex: 1 }}>
                <Typography component="span" variant="subtitle2" display="block">
                  {preset.label}
                </Typography>
                <Typography component="span" variant="caption" color="text.secondary">
                  {preset.description}
                </Typography>
              </Box>
              {active && (
                <Iconify
                  icon={GlobalIcons.approvedIcon}
                  width={18}
                  sx={{ color: 'primary.main' }}
                  aria-hidden
                />
              )}
            </ButtonBase>
          );
        })}
      </Box>
      <FormSectionCard
        title="Template Settings"
        aria-label="Template Settings"
        icon={GlobalIcons.academicFieldSettings}
      >
        <Stack spacing={2} alignItems="flex-start">
          <ShakingTextField error={nameError} sx={{ width: 1, maxWidth: 480 }}>
            <TextField
              fullWidth
              size="small"
              required
              label="Template name"
              value={template.name}
              slotProps={{ htmlInput: { maxLength: 150 } }}
              onChange={(event) => onChange({ name: event.target.value })}
              onBlur={onNameBlur}
              error={nameError}
              helperText={
                nameError
                  ? 'Template name is required.'
                  : 'Name this design so you can find and reuse it.'
              }
            />
          </ShakingTextField>
          <Stack spacing={0.5} alignItems="flex-start">
            <Typography variant="body2" fontWeight={600}>
              Orientation
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={template.orientation}
              disabled={template.schemaVersion === 2 && !readStudentICardLayout(template)}
              onChange={(_event, value: IdCardTemplate['orientation'] | null) => {
                if (value) onChange(setStudentICardOrientation(template, value));
              }}
              aria-label="Card orientation"
            >
              {orientations.map((orientation) => (
                <ToggleButton
                  key={orientation}
                  value={orientation}
                  sx={{ gap: 0.75, px: 1, minHeight: 36 }}
                >
                  <Box
                    component="span"
                    aria-hidden
                    sx={{
                      width: orientation === 'Vertical' ? 10 : 15,
                      height: orientation === 'Vertical' ? 15 : 10,
                      border: '1.5px solid currentColor',
                      borderRadius: 0.25,
                    }}
                  />
                  {orientation}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </FormSectionCard>
    </Stack>
  );
}
