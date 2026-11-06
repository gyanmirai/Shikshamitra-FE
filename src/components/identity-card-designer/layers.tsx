import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';

import { DesignerSelect } from './controls';

import type { IdentityCardElement } from './types';

export function ElementLayers({
  elements,
  selectedId,
  onSelect,
  onAdd,
  disabled,
}: {
  elements: IdentityCardElement[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: (type: IdentityCardElement['type']) => void;
  disabled?: boolean;
}) {
  const [type, setType] = useState<IdentityCardElement['type']>('text');
  return (
    <FormSectionCard
      title="Elements"
      icon={GlobalIcons.documentIcon}
      descriptionTooltip="Choose a layer to edit it. Hidden and locked elements remain in this list. Add only the fields permitted for this card type."
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <DesignerSelect
          label="Element type"
          value={type}
          options={['text', 'photo', 'logo', 'qr', 'barcode', 'shape', 'line'].map((value) => ({
            value,
            label: value.charAt(0).toUpperCase() + value.slice(1),
          }))}
          onChange={(value) => setType(value as IdentityCardElement['type'])}
          disabled={disabled}
        />
        <Button
          type="button"
          size="small"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          disabled={disabled}
          onClick={() => onAdd(type)}
          sx={{ flexShrink: 0 }}
        >
          Add element
        </Button>
      </Stack>
      <DesignerSelect
        label="Selected element"
        value={selectedId}
        disabled={disabled}
        options={[
          { value: '', label: 'Choose an element' },
          ...[...elements]
            .sort((a, b) => b.z - a.z)
            .map((element) => ({
              value: element.id,
              label: `${element.label || element.type}${element.locked ? ' (locked)' : ''}${!element.visible ? ' (hidden)' : ''}`,
            })),
        ]}
        onChange={onSelect}
      />
    </FormSectionCard>
  );
}
