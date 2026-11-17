import type { Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';

// Match the Academic dashboard's card surface while leaving the statement note independent.
export const financeDashboardCardSx = {
  p: 2,
  height: '100%',
  bgcolor: 'background.paper',
  border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
  boxShadow: (theme: Theme) => `0 8px 20px ${alpha(theme.palette.common.black, 0.08)}`,
};

export const financeDashboardTileSx = {
  p: 1.5,
  minWidth: 0,
  height: '100%',
  borderRadius: 1,
  bgcolor: 'background.neutral',
  border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
};
