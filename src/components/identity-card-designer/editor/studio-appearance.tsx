import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { designerGrid, DesignerNumber, DesignerSelect } from '../controls';

import type { IdentityCardElement } from '../types';

export function StudioAppearance({
  element,
  onChange,
  disabled,
}: {
  element?: IdentityCardElement;
  onChange: (element: IdentityCardElement) => void;
  disabled?: boolean;
}) {
  if (!element) return null;
  const readOnly = disabled || element.locked;
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={designerGrid}>
        <DesignerNumber
          label="Rotation (degrees)"
          value={element.rotation ?? 0}
          min={-180}
          max={180}
          disabled={readOnly}
          onChange={(rotation) => onChange({ ...element, rotation })}
        />
        <DesignerNumber
          label="Opacity (%)"
          value={(element.opacity ?? 1) * 100}
          min={0}
          max={100}
          disabled={readOnly}
          onChange={(value) => onChange({ ...element, opacity: value / 100 })}
        />
      </Box>
      {element.type === 'shape' && (
        <DesignerSelect
          label="Shape"
          value={element.style?.shape ?? 'rectangle'}
          options={[
            { value: 'rectangle', label: 'Rectangle' },
            { value: 'ellipse', label: 'Ellipse' },
          ]}
          disabled={readOnly}
          onChange={(shape) =>
            onChange({
              ...element,
              style: { ...element.style, shape: shape as 'rectangle' | 'ellipse' },
            })
          }
        />
      )}
      {element.type === 'text' && (
        <ToggleButtonGroup
          size="small"
          aria-label="Text formatting"
          disabled={readOnly}
          value={[
            ...(Number(element.style?.fontWeight) >= 600 || element.style?.fontWeight === 'bold'
              ? ['bold']
              : []),
            ...(element.style?.fontStyle === 'italic' ? ['italic'] : []),
            ...(element.style?.textDecoration === 'underline' ? ['underline'] : []),
          ]}
          onChange={(_, values: string[]) =>
            onChange({
              ...element,
              style: {
                ...element.style,
                fontWeight: values.includes('bold') ? 700 : 400,
                fontStyle: values.includes('italic') ? 'italic' : 'normal',
                textDecoration: values.includes('underline') ? 'underline' : 'none',
              },
            })
          }
        >
          <ToggleButton value="bold" aria-label="Bold">
            <b>B</b>
          </ToggleButton>
          <ToggleButton value="italic" aria-label="Italic">
            <i>I</i>
          </ToggleButton>
          <ToggleButton value="underline" aria-label="Underline">
            <u>U</u>
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    </Box>
  );
}
