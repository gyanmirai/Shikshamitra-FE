import { GlobalIcons } from 'src/utils/icons';
import { Box, Radio, Stack, RadioGroup, Typography, FormControlLabel } from '@mui/material';
import { ADMISSION_PRINT_PALETTES } from 'src/redux/student/admissions/admission-form-print-settings';

import {
  PrintSettingsGrid,
  PrintSettingsCard,
  PrintSettingsCards,
  PrintSettingSelect,
  PrintSettingNumber,
  PrintSettingToggle,
  PrintSettingsResetButton,
} from './admission-print-setting-controls';

import type { AdmissionPrintAdvancedTabProps } from './admission-print-advanced-types';

export function AdmissionPrintPaperStyleSettings({
  settings,
  advanced,
  update,
  onChange,
}: AdmissionPrintAdvancedTabProps) {
  const { paper, border, style } = advanced;
  return (
    <PrintSettingsCards>
      <PrintSettingsCard
        defaultExpanded
        title="Paper Setup"
        icon={GlobalIcons.documentIcon}
        action={
          <PrintSettingsResetButton
            title="Paper Setup"
            onReset={() => {
              onChange({
                ...settings,
                paperSize: 'A4',
                advanced: {
                  ...settings.advanced,
                  paper: {
                    orientation: 'portrait',
                    margins: { top: 12, right: 12, bottom: 12, left: 12 },
                  },
                },
              });
            }}
          />
        }
        descriptionTooltip="Choose the printed page size, orientation and margins in millimetres."
      >
        <PrintSettingsGrid>
          <PrintSettingSelect
            label="Paper size"
            value={settings.paperSize}
            options={[
              ['A4', 'A4'],
              ['A5', 'A5'],
              ['LETTER', 'Letter'],
              ['LEGAL', 'Legal'],
            ]}
            onChange={(paperSize) => onChange({ ...settings, paperSize })}
          />
          <PrintSettingSelect
            label="Orientation"
            value={paper.orientation}
            options={[
              ['portrait', 'Portrait'],
              ['landscape', 'Landscape'],
            ]}
            onChange={(orientation) => update('paper', { orientation })}
          />
          {(['top', 'right', 'bottom', 'left'] as const).map((edge) => (
            <PrintSettingNumber
              key={edge}
              label={`${edge[0].toUpperCase()}${edge.slice(1)} margin`}
              value={paper.margins[edge]}
              min={5}
              max={30}
              unit="mm"
              onChange={(value) =>
                update('paper', { margins: { ...paper.margins, [edge]: value } })
              }
            />
          ))}
        </PrintSettingsGrid>
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Page Border"
        icon={GlobalIcons.stationaryIcon}
        action={
          <PrintSettingsResetButton
            title="Page Border"
            onReset={() =>
              update('border', {
                enabled: false,
                placement: 'every',
                style: 'single',
                thickness: 'thin',
                inset: 8,
                corners: 'square',
                sectionBorders: true,
                fieldBorders: true,
                dividers: true,
              })
            }
          />
        }
        descriptionTooltip="Page borders and section dividers affect the printed copy only."
      >
        <PrintSettingToggle
          label="Show page border"
          checked={border.enabled}
          onChange={(enabled) => update('border', { enabled })}
        />
        <PrintSettingsGrid>
          <PrintSettingSelect
            label="Border pages"
            value={border.placement}
            disabled={!border.enabled}
            options={[
              ['first', 'First page'],
              ['every', 'Every page'],
            ]}
            onChange={(placement) => update('border', { placement })}
          />
          <PrintSettingSelect
            label="Border style"
            value={border.style}
            disabled={!border.enabled}
            options={[
              ['single', 'Single line'],
              ['double', 'Double line'],
            ]}
            onChange={(value) => update('border', { style: value })}
          />
          <PrintSettingSelect
            label="Border thickness"
            value={border.thickness}
            disabled={!border.enabled}
            options={[
              ['thin', 'Thin'],
              ['medium', 'Medium'],
              ['thick', 'Thick'],
            ]}
            onChange={(thickness) => update('border', { thickness })}
          />
          <PrintSettingNumber
            label="Border inset"
            value={border.inset}
            min={2}
            max={25}
            unit="mm"
            disabled={!border.enabled}
            onChange={(inset) => update('border', { inset })}
          />
          <PrintSettingSelect
            label="Border corners"
            value={border.corners}
            disabled={!border.enabled}
            options={[
              ['square', 'Square'],
              ['rounded', 'Rounded'],
            ]}
            onChange={(corners) => update('border', { corners })}
          />
        </PrintSettingsGrid>
        <PrintSettingToggle
          label="Section borders"
          checked={border.sectionBorders}
          onChange={(sectionBorders) => update('border', { sectionBorders })}
        />
        <PrintSettingToggle
          label="Field borders"
          checked={border.fieldBorders}
          onChange={(fieldBorders) => update('border', { fieldBorders })}
        />
        <PrintSettingToggle
          label="Row dividers"
          checked={border.dividers}
          onChange={(dividers) => update('border', { dividers })}
        />
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Print Colours"
        icon={GlobalIcons.academicTextCase}
        action={
          <PrintSettingsResetButton
            title="Print Colours"
            onReset={() =>
              update('style', { palette: 'neutral', ...ADMISSION_PRINT_PALETTES.neutral })
            }
          />
        }
        descriptionTooltip="Change paper colours without changing the online form. Black and white uses printer-friendly monochrome colours."
      >
        <RadioGroup
          aria-label="Colour palette"
          value={style.palette}
          onChange={(_, palette) => {
            const key = palette as keyof typeof ADMISSION_PRINT_PALETTES;
            update('style', { palette: key, ...ADMISSION_PRINT_PALETTES[key] });
          }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          {(
            [
              ['school-blue', 'School blue'],
              ['neutral', 'Neutral'],
              ['forest-green', 'Forest green'],
              ['monochrome', 'Black and white'],
            ] as const
          ).map(([palette, label]) => (
            <FormControlLabel
              key={palette}
              value={palette}
              control={<Radio size="small" />}
              label={
                <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                  <Typography variant="body2">{label}</Typography>
                  <Stack direction="row" spacing={0.5} aria-hidden="true">
                    {[
                      ADMISSION_PRINT_PALETTES[palette].sectionFill,
                      ADMISSION_PRINT_PALETTES[palette].borderColor,
                      ADMISSION_PRINT_PALETTES[palette].textColor,
                    ].map((color, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 24,
                          height: 10,
                          borderRadius: 0.5,
                          bgcolor: color,
                          border: 1,
                          borderColor: 'divider',
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              }
              sx={{
                m: 0,
                minWidth: 0,
                p: 1,
                border: 1,
                borderRadius: 1,
                borderColor: style.palette === palette ? 'primary.main' : 'divider',
                bgcolor: style.palette === palette ? 'action.selected' : undefined,
                '& .MuiFormControlLabel-label': { minWidth: 0, flex: 1 },
              }}
            />
          ))}
        </RadioGroup>
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Typography"
        icon={GlobalIcons.academicTextCase}
        action={
          <PrintSettingsResetButton
            title="Typography"
            onReset={() =>
              update('style', {
                fontFamily: 'sans',
                baseSize: 10,
                titleSize: 16,
                labelWeight: 'semibold',
              })
            }
          />
        }
        descriptionTooltip="Set the font and printed text sizes. These settings do not change online question labels or answers."
      >
        <PrintSettingsGrid>
          <RadioGroup
            aria-label="Font family"
            value={style.fontFamily}
            onChange={(_, fontFamily) =>
              update('style', { fontFamily: fontFamily as typeof style.fontFamily })
            }
            sx={{
              gridColumn: '1 / -1',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            {(
              [
                ['sans', 'Sans serif'],
                ['serif', 'Serif'],
                ['monospace', 'Monospace'],
                ['roboto', 'Roboto'],
              ] as const
            ).map(([family, label]) => (
              <FormControlLabel
                key={family}
                value={family}
                control={<Radio size="small" />}
                label={
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily:
                        family === 'serif'
                          ? 'serif'
                          : family === 'monospace'
                            ? 'monospace'
                            : family === 'roboto'
                              ? 'Roboto, sans-serif'
                              : 'sans-serif',
                    }}
                  >
                    {label}
                  </Typography>
                }
                sx={{
                  m: 0,
                  p: 0.5,
                  border: 1,
                  borderRadius: 1,
                  borderColor: style.fontFamily === family ? 'primary.main' : 'divider',
                  bgcolor: style.fontFamily === family ? 'action.selected' : undefined,
                }}
              />
            ))}
          </RadioGroup>
          <PrintSettingNumber
            label="Body text size"
            value={style.baseSize}
            min={8}
            max={14}
            unit="pt"
            onChange={(baseSize) => update('style', { baseSize })}
          />
          <PrintSettingNumber
            label="Title text size"
            value={style.titleSize}
            min={12}
            max={24}
            unit="pt"
            onChange={(titleSize) => update('style', { titleSize })}
          />
          <PrintSettingSelect
            label="Field label weight"
            value={style.labelWeight}
            options={[
              ['regular', 'Regular'],
              ['semibold', 'Semibold'],
            ]}
            onChange={(labelWeight) => update('style', { labelWeight })}
          />
        </PrintSettingsGrid>
      </PrintSettingsCard>
    </PrintSettingsCards>
  );
}
