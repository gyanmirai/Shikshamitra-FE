import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, TextField, Typography } from '@mui/material';

import { ElementStyle } from './element-style';
import { designerGrid, DesignerNumber, DesignerSelect, DesignerSwitch } from './controls';

import type { IdentityCardElement, IdentityCardFieldOption } from './types';

export function ElementInspector({
  element,
  fields,
  onChange,
  onDelete,
  disabled,
}: {
  element?: IdentityCardElement;
  fields: IdentityCardFieldOption[];
  onChange: (element: IdentityCardElement) => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  if (!element)
    return (
      <Typography variant="body2" color="text.secondary">
        Select an element on the card or in the layer list to edit its content and position.
      </Typography>
    );
  const readOnly = disabled || element.locked;
  const options = [
    { value: 'static', label: 'Static text' },
    ...fields
      .filter((field) => field.key !== 'static')
      .map((field) => ({ value: field.key, label: field.label })),
    ...[
      { key: 'schoolName', label: 'School name' },
      { key: 'schoolAddress', label: 'School address' },
    ]
      .filter((field) => !fields.some((item) => item.key === field.key))
      .map((field) => ({ value: field.key, label: field.label })),
  ];
  return (
    <FormSectionCard
      title="Selected Element"
      icon={GlobalIcons.edit}
      descriptionTooltip="Position and dimensions use design canvas units. Layer order controls which elements are drawn above others. Unlock an element to edit it."
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
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
      {element.type === 'text' && (
        <>
          <DesignerSelect
            label="Value source"
            value={element.fieldKey || 'static'}
            options={options}
            onChange={(fieldKey) => onChange({ ...element, fieldKey })}
            disabled={readOnly}
          />
          {(!element.fieldKey || element.fieldKey === 'static') && (
            <TextField
              label="Static text"
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={element.value ?? ''}
              onChange={(event) => onChange({ ...element, value: event.target.value })}
              disabled={readOnly}
            />
          )}
          {['headerText', 'footerText'].includes(element.fieldKey ?? '') && (
            <Typography variant="caption" color="text.secondary">
              This value comes from the card branding settings.
            </Typography>
          )}
        </>
      )}
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
      <ElementStyle element={element} onChange={onChange} disabled={readOnly} />
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
    </FormSectionCard>
  );
}
