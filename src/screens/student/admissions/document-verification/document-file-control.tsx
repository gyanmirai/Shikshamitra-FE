import type { IconButtonProps } from '@mui/material';

import { IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

export function DocumentFileControl({
  label,
  icon,
  disabled,
  reason,
  onClick,
  color,
}: {
  label: string;
  icon: string;
  disabled: boolean;
  reason?: string;
  onClick?: () => void;
  color?: IconButtonProps['color'];
}) {
  return (
    <CustomTooltip title={disabled ? reason || label : label} placement="right" arrow>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Disabled controls need a focusable tooltip wrapper. */}
      <span tabIndex={disabled ? 0 : undefined}>
        <IconButton
          size="small"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          color={disabled ? 'default' : color}
          sx={{ p: 0, width: 30, height: 30 }}
        >
          <Iconify icon={icon} width={16} />
        </IconButton>
      </span>
    </CustomTooltip>
  );
}
