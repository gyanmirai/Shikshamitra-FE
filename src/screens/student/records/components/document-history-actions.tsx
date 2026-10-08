import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Menu, Stack, Tooltip, MenuItem, IconButton, ListItemIcon } from '@mui/material';

type Action = {
  label: string;
  icon: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
};
type Props = { number: string; actions: Action[] };

export default function DocumentHistoryActions({ number, actions }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const disabledReason = 'This document is voided or another document action is in progress.';
  if (actions.length <= 3) {
    return (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        {actions.map((action) => (
          <Tooltip
            key={action.label}
            title={action.disabled ? disabledReason : `${action.label} ${number}`}
          >
            <span>
              <IconButton
                aria-label={`${action.label} ${number}`}
                disabled={action.disabled}
                color={action.danger ? 'error' : 'default'}
                onClick={action.onClick}
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon={action.icon} width={20} />
              </IconButton>
            </span>
          </Tooltip>
        ))}
      </Stack>
    );
  }
  return (
    <>
      <Tooltip title={`Actions for ${number}`}>
        <IconButton
          aria-label={`Actions for ${number}`}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          aria-controls={anchor ? `document-actions-${number}` : undefined}
          onClick={(event) => setAnchor(event.currentTarget)}
          sx={{ width: 44, height: 44 }}
        >
          <Iconify icon="eva:more-vertical-fill" width={20} />
        </IconButton>
      </Tooltip>
      <Menu
        id={`document-actions-${number}`}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.label}
            aria-label={`${action.label} ${number}`}
            disabled={action.disabled}
            onClick={() => {
              setAnchor(null);
              action.onClick();
            }}
            sx={{ color: action.danger && !action.disabled ? 'error.main' : undefined }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <Iconify icon={action.icon} width={20} />
            </ListItemIcon>
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
