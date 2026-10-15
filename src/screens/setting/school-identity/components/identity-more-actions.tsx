import { useState } from 'react';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { Iconify } from 'src/components/iconify';

export function IdentityMoreActions({
  disabled,
  canCopy,
  onCopy,
  onReset,
}: {
  disabled: boolean;
  canCopy: boolean;
  onCopy: () => void;
  onReset: () => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Button
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-controls={anchor ? 'identity-more-actions' : undefined}
        startIcon={<Iconify icon="mdi:dots-horizontal" width={18} />}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        More actions
      </Button>
      <Menu
        id="identity-more-actions"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        {canCopy && (
          <MenuItem
            disabled={disabled}
            onClick={() => {
              setAnchor(null);
              onCopy();
            }}
          >
            Copy from another year
          </MenuItem>
        )}
        <MenuItem
          disabled={disabled}
          onClick={() => {
            setAnchor(null);
            onReset();
          }}
        >
          Reset to inherited
        </MenuItem>
      </Menu>
    </>
  );
}
