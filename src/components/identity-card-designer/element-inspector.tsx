import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, TextField, Typography } from '@mui/material';

import { ElementStyle } from './element-style';
import { ElementDataSource } from './element-data-source';
import { StudioAppearance } from './editor/studio-appearance';
import { designerGrid, DesignerNumber, DesignerSwitch } from './controls';

import type { IdentityCardElement, IdentityCardFieldOption } from './types';

export function ElementInspector({
  element,
  fields,
  fieldPickerLabel,
  onChange,
  onDelete,
  disabled,
  borderStylesEnabled,
  themeColor,
  showEmptySelectionHint = true,
}: {
  element?: IdentityCardElement;
  fields: IdentityCardFieldOption[];
  fieldPickerLabel?: string;
  onChange: (element: IdentityCardElement) => void;
  onDelete: () => void;
  disabled?: boolean;
  borderStylesEnabled?: boolean;
  themeColor?: string;
  showEmptySelectionHint?: boolean;
}) {
  if (!element)
    return showEmptySelectionHint ? (
      <Typography variant="body2" color="text.secondary">
        Select an element on the card or in the layer list to edit its content and position.
      </Typography>
    ) : null;
  const readOnly = disabled || element.locked;
  const textElement = element.type === 'text';
  return (
    <>
      {textElement && (
        <FormSectionCard
          title="Selected Element"
          icon={GlobalIcons.edit}
          descriptionTooltip="Enter text to print the same words on each card, or choose a field to insert its value for each cardholder."
        >
          <ElementDataSource
            element={element}
            fields={fields}
            fieldPickerLabel={fieldPickerLabel}
            onChange={onChange}
            disabled={readOnly}
          />
        </FormSectionCard>
      )}
      <FormSectionCard
        key={element.id}
        title="Position & Style"
        icon={GlobalIcons.edit}
        descriptionTooltip="Position and dimensions use canvas units. Layer order controls what is drawn on top. Unlock an element to edit it."
        collapsible
        defaultExpanded={!fieldPickerLabel || !textElement || Boolean(element.locked)}
      >
        <TextField
          label="Element label"
          size="small"
          fullWidth
          value={element.label ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange({ ...element, label: event.target.value })}
        />
        <Stack direction="row" flexWrap="wrap">
          <DesignerSwitch
            label="Visible"
            checked={element.visible}
            onChange={(visible) => onChange({ ...element, visible })}
            disabled={readOnly}
          />
          <DesignerSwitch
            label="Locked"
            checked={Boolean(element.locked)}
            onChange={(locked) => onChange({ ...element, locked })}
            disabled={disabled}
          />
        </Stack>
        <Box sx={designerGrid}>
          {(['x', 'y', 'w', 'h', 'z'] as const).map((key) => (
            <DesignerNumber
              key={key}
              label={
                {
                  x: 'X position (canvas)',
                  y: 'Y position (canvas)',
                  w: 'Width (canvas)',
                  h: 'Height (canvas)',
                  z: 'Layer order',
                }[key]
              }
              value={element[key]}
              onChange={(value) => onChange({ ...element, [key]: value })}
              disabled={readOnly}
            />
          ))}
        </Box>
        <ElementStyle
          element={element}
          onChange={onChange}
          disabled={readOnly}
          borderStylesEnabled={borderStylesEnabled}
          themeColor={themeColor}
        />
        <StudioAppearance element={element} onChange={onChange} disabled={readOnly} />
      </FormSectionCard>
      <Button
        type="button"
        size="small"
        color="error"
        variant="outlined"
        startIcon={<Iconify icon={GlobalIcons.delete} />}
        disabled={readOnly}
        onClick={onDelete}
      >
        Remove element
      </Button>
    </>
  );
}
