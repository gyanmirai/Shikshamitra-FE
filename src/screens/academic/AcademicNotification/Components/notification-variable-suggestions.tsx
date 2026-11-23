import { useRef, useEffect } from 'react';
import { List, Paper, Popper, Typography, ListItemButton } from '@mui/material';

import type { TemplateVariable } from '../notification-template-model';

export function NotificationVariableSuggestions({ anchor, field, listId, matches, activeId, onInsert }: {
  anchor: HTMLElement;
  field: 'Subject' | 'Message';
  listId: string;
  matches: TemplateVariable[];
  activeId?: string;
  onInsert: (key: string) => void;
}) {
  const activeOption = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeOption.current?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  return (
    <Popper open anchorEl={anchor} placement="bottom-start"
      container={() => anchor.closest('[role="dialog"]') ?? anchor.ownerDocument.body}
      sx={{ width: 280, maxWidth: 'calc(100vw - 32px)', zIndex: (theme) => theme.zIndex.modal + 1 }}
      modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}>
      <Paper elevation={8}>
        <List dense disablePadding id={listId} role="listbox" aria-label={`${field} variables`}
          sx={{ maxHeight: 224, overflowY: 'auto' }}>
          {matches.map(({ key }, index) => {
            const id = `${listId}-${index}`;
            const selected = id === activeId;
            return (
              <ListItemButton key={key} id={id} ref={selected ? activeOption : undefined}
                role="option" aria-selected={selected} selected={selected} tabIndex={-1}
                sx={{ minHeight: 44, overflowWrap: 'anywhere' }}
                onMouseDown={(event) => event.preventDefault()} onClick={() => onInsert(key)}>
                {key.replaceAll('_', ' ')}
              </ListItemButton>
            );
          })}
        </List>
        {!matches.length && (
          <Typography role="status" variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
            No matching variables
          </Typography>
        )}
      </Paper>
    </Popper>
  );
}
