import { GlobalIcons } from 'src/utils/icons';
import { Box, Stack, TextField } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { PresetSelect } from './preset-select';
import { designerGrid, DesignerNumber, DesignerSwitch } from './controls';

import type { IdentityCardDesignerProps } from './types';

export function LayoutSettings(
  props: IdentityCardDesignerProps & { guides: boolean; onGuidesChange: (value: boolean) => void }
) {
  const {
    layout,
    onLayoutChange,
    disabled,
    backSideEnabled,
    onBackSideEnabledChange,
    qrCodeEnabled,
    onQrCodeEnabledChange,
    barcodeEnabled,
    onBarcodeEnabledChange,
    guides,
    onGuidesChange,
  } = props;
  return (
    <FormSectionCard
      title="Card Layout"
      icon={GlobalIcons.academicFieldSettings}
      descriptionTooltip="Finished dimensions are in millimetres. Position and type controls use the independent design canvas."
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
    >
      <PresetSelect {...props} />
      <Box sx={designerGrid}>
        {(['widthMm', 'heightMm'] as const).map((key) => (
          <DesignerNumber
            key={key}
            label={key === 'widthMm' ? 'Width (mm)' : 'Height (mm)'}
            required
            value={layout[key]}
            min={30}
            max={200}
            disabled={disabled}
            onChange={(value) =>
              onLayoutChange({
                ...layout,
                [key]: value,
                orientation:
                  (key === 'widthMm' ? value : layout.widthMm) >=
                  (key === 'heightMm' ? value : layout.heightMm)
                    ? 'Horizontal'
                    : 'Vertical',
              })
            }
          />
        ))}
      </Box>
      <Box sx={designerGrid}>
        {(['themeColor', 'backgroundColor'] as const).map((key) => (
          <TextField
            key={key}
            size="small"
            fullWidth
            label={key === 'themeColor' ? 'School accent' : 'Card background'}
            type="color"
            value={layout[key]}
            disabled={disabled}
            onChange={(event) => {
              const { value } = event.target;
              const recolor = (side: 'front' | 'back') => ({
                elements: (layout[side]?.elements ?? []).map((element) => ({
                  ...element,
                  style: Object.fromEntries(
                    Object.entries(element.style ?? {}).map(([styleKey, old]) => [
                      styleKey,
                      old === layout[key] || element.paletteBindings?.[styleKey as 'color'] === key
                        ? value
                        : old,
                    ])
                  ),
                })),
              });
              onLayoutChange({
                ...layout,
                [key]: value,
                front: recolor('front'),
                ...(layout.back ? { back: recolor('back') } : {}),
              });
            }}
          />
        ))}
      </Box>
      <Stack>
        <DesignerSwitch label="Show safe-area guide" checked={guides} onChange={onGuidesChange} />
        <DesignerSwitch
          label="Enable back side"
          checked={backSideEnabled}
          onChange={onBackSideEnabledChange}
          disabled={disabled}
        />
        <DesignerSwitch
          label="Enable QR code"
          checked={qrCodeEnabled}
          onChange={onQrCodeEnabledChange}
          disabled={disabled}
        />
        {onBarcodeEnabledChange && (
          <DesignerSwitch
            label="Enable barcode"
            checked={Boolean(barcodeEnabled)}
            onChange={onBarcodeEnabledChange}
            disabled={disabled}
          />
        )}
      </Stack>
    </FormSectionCard>
  );
}
