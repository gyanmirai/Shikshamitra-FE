import { Box, TextField } from '@mui/material';

import { designerGrid, DesignerNumber, DesignerSelect, DesignerSwitch } from './controls';

import type { IdentityCardElement } from './types';

export function ElementStyle({
  element,
  onChange,
  disabled,
}: {
  element: IdentityCardElement;
  onChange: (element: IdentityCardElement) => void;
  disabled?: boolean;
}) {
  const style = element.style ?? {};
  const update = (next: Partial<NonNullable<IdentityCardElement['style']>>) =>
    onChange({
      ...element,
      style: { ...style, ...next },
      paletteBindings: {
        ...element.paletteBindings,
        ...Object.fromEntries(
          Object.keys(next)
            .filter((key) => ['color', 'backgroundColor', 'borderColor'].includes(key))
            .map((key) => [key, undefined])
        ),
      },
    });
  return (
    <>
      {element.type === 'text' && (
        <>
          <Box sx={designerGrid}>
            <DesignerSelect
              label="Font family"
              value={style.fontFamily ?? 'Arial'}
              options={['Arial', 'sans-serif', 'Inter', 'Roboto', 'Noto Sans', 'Lato'].map(
                (value) => ({ value, label: value })
              )}
              onChange={(fontFamily) => update({ fontFamily })}
              disabled={disabled}
            />
            <DesignerNumber
              label="Font size (canvas)"
              value={style.fontSize ?? 12}
              min={4}
              max={100}
              onChange={(fontSize) => update({ fontSize })}
              disabled={disabled}
            />
          </Box>
          <Box sx={designerGrid}>
            <DesignerSelect
              label="Font weight"
              value={style.fontWeight ?? 400}
              options={[
                { value: 400, label: 'Regular' },
                { value: 500, label: 'Medium' },
                { value: 600, label: 'Semibold' },
                { value: 700, label: 'Bold' },
              ]}
              onChange={(fontWeight) => update({ fontWeight: Number(fontWeight) })}
              disabled={disabled}
            />
            <DesignerSelect
              label="Text alignment"
              value={style.textAlign ?? 'left'}
              options={['left', 'center', 'right'].map((value) => ({ value, label: value }))}
              onChange={(textAlign) =>
                update({ textAlign: textAlign as 'left' | 'center' | 'right' })
              }
              disabled={disabled}
            />
          </Box>
          <DesignerSwitch
            label="Show field label"
            checked={Boolean(style.showLabel)}
            onChange={(showLabel) => update({ showLabel })}
            disabled={disabled}
          />
          {style.showLabel && (
            <TextField
              label="Label separator"
              size="small"
              fullWidth
              value={style.separator ?? ': '}
              onChange={(event) => update({ separator: event.target.value })}
              disabled={disabled}
            />
          )}
        </>
      )}
      <Box sx={designerGrid}>
        {(['color', 'backgroundColor', 'borderColor'] as const).map((key) => (
          <TextField
            key={key}
            size="small"
            fullWidth
            type="color"
            label={
              {
                color: 'Text colour',
                backgroundColor: 'Background colour',
                borderColor: 'Border colour',
              }[key]
            }
            value={style[key] ?? (key === 'color' ? '#1C252E' : '#FFFFFF')}
            onChange={(event) => update({ [key]: event.target.value })}
            disabled={disabled}
          />
        ))}
        <DesignerNumber
          label="Border width (canvas)"
          value={style.borderWidth ?? 0}
          min={0}
          onChange={(borderWidth) => update({ borderWidth })}
          disabled={disabled}
        />
      </Box>
      {element.type === 'photo' && (
        <DesignerSelect
          label="Photo shape"
          value={style.photoShape ?? 'rounded'}
          options={['square', 'rounded', 'circle'].map((value) => ({ value, label: value }))}
          onChange={(photoShape) =>
            update({ photoShape: photoShape as 'square' | 'rounded' | 'circle' })
          }
          disabled={disabled}
        />
      )}
      <DesignerNumber
        label="Corner radius (canvas)"
        value={style.borderRadius ?? 0}
        min={0}
        onChange={(borderRadius) => update({ borderRadius })}
        disabled={disabled}
      />
    </>
  );
}
