import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import { Box, Card, CardHeader } from '@mui/material';

import { dashboardSurfaceSx } from './admin-dashboard-card-theme';

type DashboardSectionCardProps = {
  title: string;
  subheader?: string;
  action?: ReactNode;
  minHeight?: number | string;
  height?: number | string;
  contentSx?: SxProps<Theme>;
  children: ReactNode;
};

export function DashboardSectionCard({
  title,
  subheader,
  action,
  minHeight,
  height,
  contentSx,
  children,
}: DashboardSectionCardProps) {
  return (
    <Card
      sx={{
        height,
        minHeight,
        p: 2,
        overflow: 'visible',
        position: 'relative',
        ...dashboardSurfaceSx,
      }}
    >
      <CardHeader sx={{ p: 0, mb: 1.5 }} title={title} subheader={subheader} action={action} />
      <Box sx={contentSx}>{children}</Box>
    </Card>
  );
}
