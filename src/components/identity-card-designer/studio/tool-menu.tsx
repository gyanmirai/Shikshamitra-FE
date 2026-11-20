import { useState } from 'react';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { Iconify } from 'src/components/iconify';

type ToolMenuProps = {
  label: string;
  icon: string;
  disabled?: boolean;
  items: { label: string; onClick: () => void; disabled?: boolean }[];
};

export function ToolMenu({ label, icon, disabled, items }: ToolMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Button
        size="small"
        color="inherit"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        disabled={disabled}
        onClick={(event) => setAnchor(event.currentTarget)}
        startIcon={<Iconify icon={icon} width={18} />}
      >
        {label.replace(' selection', '')}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {items.map((item) => (
          <MenuItem
            key={item.label}
            disabled={item.disabled || disabled}
            onClick={() => {
              setAnchor(null);
              item.onClick();
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
