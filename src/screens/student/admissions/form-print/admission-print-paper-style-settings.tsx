import { TextField } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';
import { ADMISSION_PRINT_PALETTES } from 'src/redux/student/admissions/admission-form-print-settings';

import {
  PrintSettingsGrid,
  PrintSettingsCards,
  PrintSettingSelect,
  PrintSettingNumber,
  PrintSettingToggle,
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
      <FormSectionCard
        title="Paper Setup"
        icon={GlobalIcons.documentIcon}
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
      </FormSectionCard>
      <FormSectionCard
        title="Page Border"
        icon={GlobalIcons.stationaryIcon}
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
      </FormSectionCard>
      <FormSectionCard
        title="Print Colours"
        icon={GlobalIcons.academicTextCase}
        descriptionTooltip="Change paper colours without changing the online form. Black and white uses printer-friendly monochrome colours."
      >
        <PrintSettingsGrid>
          <PrintSettingSelect
            label="Colour palette"
            value={style.palette}
            options={[
              ['school-blue', 'School blue'],
              ['neutral', 'Neutral'],
              ['monochrome', 'Black and white'],
            ]}
            onChange={(palette) =>
              update('style', { palette, ...ADMISSION_PRINT_PALETTES[palette] })
            }
          />
          {(
            [
              ['sectionFill', 'Section fill'],
              ['borderColor', 'Border colour'],
              ['textColor', 'Text colour'],
            ] as const
          ).map(([key, label]) => (
            <TextField
              key={key}
              name={key}
              label={label}
              type="color"
              size="small"
              fullWidth
              value={style[key]}
              disabled={style.palette === 'monochrome'}
              onChange={(event) => update('style', { [key]: event.target.value })}
            />
          ))}
        </PrintSettingsGrid>
      </FormSectionCard>
      <FormSectionCard
        title="Typography"
        icon={GlobalIcons.academicTextCase}
        descriptionTooltip="Set the font and printed text sizes. These settings do not change online question labels or answers."
      >
        <PrintSettingsGrid>
          <PrintSettingSelect
            label="Font family"
            value={style.fontFamily}
            options={[
              ['sans', 'Sans serif'],
              ['serif', 'Serif'],
            ]}
            onChange={(fontFamily) => update('style', { fontFamily })}
          />
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
      </FormSectionCard>
    </PrintSettingsCards>
  );
}
