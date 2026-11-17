import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import { ToolButton } from './tool-button';

import type { IdentityCardElement } from '../types';
import type { StudioController } from './use-card-studio';

type StudioLayerRowProps = {
  element: IdentityCardElement;
  controller: StudioController;
  disabled?: boolean;
};

export function StudioLayerRow({ element, controller: c, disabled }: StudioLayerRowProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const label = element.label || element.fieldKey || element.type;
  const selected = c.selectedIds.includes(element.id);
  const blocked = disabled || element.locked;
  function finish() {
    if (draft?.trim()) c.renameElement(element.id, draft.trim());
    setDraft(null);
  }
  function select(extend: boolean) {
    c.setSelectedIds(
      extend
        ? selected
          ? c.selectedElements.filter((item) => item.id !== element.id &&
            (!element.groupId || item.groupId !== element.groupId)).map((item) => item.id)
          : [...c.selectedIds, element.id]
        : [element.id]
    );
  }
  return (
    <Stack component="li" direction="row" alignItems="center" sx={{ minWidth: 0, px: 0.5 }}>
      {draft === null ? (
        <ListItemButton
          selected={selected}
          aria-label={`Select ${label}`}
          aria-pressed={selected}
          onClick={(event) => select(event.shiftKey || event.ctrlKey || event.metaKey)}
          onDoubleClick={() => {
            if (!blocked) setDraft(label);
          }}
          sx={{ minWidth: 0, px: 0.75, py: 0.75 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {label}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {[
                element.type,
                element.groupId ? 'Grouped' : '',
                !element.visible ? 'Hidden' : '',
                element.locked ? 'Locked' : '',
              ]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Box>
        </ListItemButton>
      ) : (
        <TextField
          size="small"
          value={draft}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => finish()}
          inputProps={{ 'aria-label': 'Layer name', maxLength: 100 }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') finish();
            if (event.key === 'Escape') setDraft(null);
          }}
        />
      )}
      <ToolButton
        label={`Rename ${label}`}
        icon="mdi:pencil"
        disabled={blocked}
        onClick={() => setDraft(label)}
      />
      <ToolButton
        label={`${element.visible ? 'Hide' : 'Show'} ${label}`}
        icon={element.visible ? 'mdi:eye' : 'mdi:eye-off'}
        disabled={blocked}
        onClick={() => c.toggleVisibility(element.id)}
      />
      <ToolButton
        label={`${element.locked ? 'Unlock' : 'Lock'} ${label}`}
        icon={element.locked ? 'mdi:lock' : 'mdi:lock-open'}
        disabled={disabled}
        onClick={() => c.toggleLock(element.id)}
      />
    </Stack>
  );
}
