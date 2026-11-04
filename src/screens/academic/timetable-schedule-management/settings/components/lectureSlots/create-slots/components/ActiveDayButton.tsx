import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, ToggleButton } from '@mui/material';

interface Props {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function ActiveDayButton({ label, selected, disabled, onClick }: Props) {
  return (
    <ToggleButton
      value={label}
      selected={selected}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${label}: ${selected ? 'active' : 'inactive'}`}
      sx={(theme) => ({
        minHeight: 44,
        minWidth: 44,
        px: 1,
        borderRadius: 0,
        fontSize: '0.875rem',
        fontWeight: selected ? 700 : 500,
        border: 0,
        textTransform: 'none',
        gap: 0.75,
        bgcolor: 'background.paper',
        color: 'text.secondary',
        '&.Mui-selected, &.Mui-selected:hover': {
          bgcolor: 'primary.lighter',
          color: 'primary.darker',
          ...theme.applyStyles('dark', {
            bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
            color: theme.vars.palette.primary.light,
          }),
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.vars.palette.primary.main}`,
          outlineOffset: -2,
        },
      })}
    >
      <Box component="span" sx={{ width: 16, height: 16, display: 'inline-flex' }}>
        {selected && <Iconify icon={GlobalIcons.approvedIcon} width={16} aria-hidden />}
      </Box>
      {label}
    </ToggleButton>
  );
}
