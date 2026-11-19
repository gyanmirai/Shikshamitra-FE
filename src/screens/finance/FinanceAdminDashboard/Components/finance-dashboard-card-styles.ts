import type { Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';

export const financeDashboardCardSx = {
  p: 2,
  height: '100%',
  bgcolor: 'background.paper',
  border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
  boxShadow: (theme: Theme) => `0 8px 20px ${alpha(theme.palette.common.black, 0.08)}`,
};
