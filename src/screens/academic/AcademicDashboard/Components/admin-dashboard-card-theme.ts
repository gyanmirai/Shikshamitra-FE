import type { Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';

export type DashboardCardTone =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'secondary';

export const getToneMain = (theme: Theme, tone: DashboardCardTone) =>
  theme.palette[tone].main;

export const getToneContrast = (theme: Theme, tone: DashboardCardTone) =>
  theme.palette[tone].dark || theme.palette[tone].main;

export const dashboardSurfaceSx = {
  bgcolor: 'background.paper',
  boxShadow: (theme: Theme) => `0 8px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
};
