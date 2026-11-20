import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import CustomTooltip from 'src/components/custom-tooltip';

export type ToolButtonProps = {
  label: string;
  icon: string;
  disabled?: boolean;
  onClick: () => void;
};

export function ToolButton({ label, icon, disabled, onClick }: ToolButtonProps) {
  return (
    <CustomTooltip title={label}>
      <span>
        <IconButton
          size="small"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          sx={{ width: 36, height: 36, '@media (any-pointer: coarse)': { width: 44, height: 44 } }}
        >
          <Iconify icon={icon} width={18} />
        </IconButton>
      </span>
    </CustomTooltip>
  );
}
