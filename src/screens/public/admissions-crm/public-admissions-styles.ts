import type { ChipProps } from '@mui/material';

export const getAccessibleStatusChipProps = (
  color: ChipProps['color'] = 'default'
): Pick<ChipProps, 'variant' | 'sx'> => ({
  variant: 'outlined',
  sx: {
    color: 'text.primary',
    borderColor: color && color !== 'default' ? `${color}.main` : 'divider',
  },
});
