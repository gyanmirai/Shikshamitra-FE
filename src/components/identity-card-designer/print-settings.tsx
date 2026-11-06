import { GlobalIcons } from 'src/utils/icons';
import { Box, Alert, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { getIdentityCardSheetLayout } from './geometry';
import { designerGrid, DesignerNumber, DesignerSelect, DesignerSwitch } from './controls';

import type { IdentityCardDesignerProps, IdentityCardPrintSettings } from './types';

const choices = (values: string[]) => values.map((value) => ({ value, label: value }));

export function PrintSettings({
  layout,
  printSettings: settings,
  onPrintSettingsChange,
  disabled,
  backSideEnabled,
}: IdentityCardDesignerProps) {
  const update = <K extends keyof IdentityCardPrintSettings>(
    key: K,
    value: IdentityCardPrintSettings[K]
  ) => onPrintSettingsChange({ ...settings, [key]: value });
  const sheet = getIdentityCardSheetLayout(layout, settings);
  const numeric: {
    key: keyof Pick<
      IdentityCardPrintSettings,
      | 'cardsPerPage'
      | 'margin'
      | 'gap'
      | 'bleedMm'
      | 'safeInsetMm'
      | 'backOffsetXmm'
      | 'backOffsetYmm'
    >;
    label: string;
    min?: number;
    max?: number;
  }[] = [
    { key: 'cardsPerPage', label: 'Cards per page', min: 1, max: 10 },
    { key: 'margin', label: 'Margin (mm)', min: 0 },
    { key: 'gap', label: 'Gap (mm)', min: 0 },
    { key: 'bleedMm', label: 'Bleed per edge (mm)', min: 0 },
    { key: 'safeInsetMm', label: 'Safe inset (mm)', min: 0 },
    { key: 'backOffsetXmm', label: 'Back X offset (mm)' },
    { key: 'backOffsetYmm', label: 'Back Y offset (mm)' },
  ];
  return (
    <FormSectionCard
      title="Print Settings"
      icon={GlobalIcons.pdf}
      descriptionTooltip="Cards print at actual size. Sheet capacity includes margins, spacing and bleed. Test duplex alignment on your printer."
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
    >
      <DesignerSelect
        label="Paper size"
        value={settings.pageSize}
        options={[
          { value: 'A4', label: 'A4 sheet' },
          { value: 'Card', label: 'Exact card size' },
        ]}
        onChange={(value) => update('pageSize', value as 'A4' | 'Card')}
        disabled={disabled}
      />
      <Box sx={designerGrid}>
        {numeric.map(({ key, ...field }) => (
          <DesignerNumber
            key={key}
            {...field}
            value={settings[key]}
            onChange={(value) => update(key, value)}
            disabled={
              disabled ||
              (settings.pageSize === 'Card' && ['cardsPerPage', 'margin', 'gap'].includes(key))
            }
          />
        ))}
      </Box>
      <DesignerSelect
        label="Output sides"
        value={settings.sideMode}
        options={
          backSideEnabled
            ? [
                { value: 'both', label: 'Front and back' },
                { value: 'front', label: 'Front only' },
                { value: 'back', label: 'Back only' },
              ]
            : [
                { value: 'front', label: 'Front only' },
                { value: 'both', label: 'Front (back disabled)' },
              ]
        }
        onChange={(value) => update('sideMode', value as IdentityCardPrintSettings['sideMode'])}
        disabled={disabled}
      />
      <Box sx={designerGrid}>
        <DesignerSelect
          label="Duplex flip"
          value={settings.duplexFlip}
          options={choices(['long-edge', 'short-edge'])}
          onChange={(value) =>
            update('duplexFlip', value as IdentityCardPrintSettings['duplexFlip'])
          }
          disabled={disabled || !backSideEnabled}
        />
        <DesignerSelect
          label="Back rotation"
          value={settings.backRotation}
          options={[
            { value: 0, label: '0°' },
            { value: 180, label: '180°' },
          ]}
          onChange={(value) => update('backRotation', Number(value) as 0 | 180)}
          disabled={disabled || !backSideEnabled}
        />
      </Box>
      <DesignerSwitch
        label="Show cut marks"
        checked={settings.showCutMarks}
        onChange={(value) => update('showCutMarks', value)}
        disabled={disabled || settings.pageSize === 'Card'}
      />
      <Typography variant="body2">
        {settings.pageSize === 'Card'
          ? 'One card per exact-size PDF page.'
          : `${sheet.columns} columns × ${sheet.rows} rows · ${sheet.effectiveCardsPerPage} cards per sheet. No automatic shrinking.`}
      </Typography>
      {sheet.effectiveCardsPerPage < settings.cardsPerPage &&
        settings.pageSize === 'A4' &&
        sheet.capacity > 0 && (
          <Alert severity="info">
            The sheet holds {sheet.capacity} cards at this finished size. Export uses{' '}
            {sheet.effectiveCardsPerPage} per sheet.
          </Alert>
        )}
      {sheet.errors.map((error) => (
        <Alert severity="error" key={error}>
          {error}
        </Alert>
      ))}
      <Typography variant="caption" color="text.secondary">
        Print at actual size / 100%. Check the finished dimensions and front/back alignment before
        printing a batch.
      </Typography>
    </FormSectionCard>
  );
}
