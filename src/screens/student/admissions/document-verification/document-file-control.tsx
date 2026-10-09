import { Iconify } from 'src/components/iconify';
import { Tooltip, IconButton } from '@mui/material';

export function DocumentFileControl({
  label,
  icon,
  disabled,
  reason,
  onClick,
}: {
  label: string;
  icon: string;
  disabled: boolean;
  reason?: string;
  onClick?: () => void;
}) {
  return (
    <Tooltip title={disabled ? reason || label : label}>
      <span>
        <IconButton
          size="small"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          sx={{ p: 0, width: 30, height: 30 }}
        >
          <Iconify icon={icon} width={16} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
