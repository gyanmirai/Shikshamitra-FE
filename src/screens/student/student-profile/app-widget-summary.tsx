import type { CardProps } from '@mui/material/Card';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title: React.ReactNode;
  total: number | string | React.ReactNode;
  percent?: number;
  icon?: React.ReactNode;
  color?: string;
};

export function AppWidgetSummary({ title, icon, percent, total, sx, color, ...other }: Props) {
  // const theme = useTheme();

  // const renderTrending = (
  //   <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
  //     <Iconify
  //       width={24}
  //       icon={
  //         percent < 0
  //           ? 'solar:double-alt-arrow-down-bold-duotone'
  //           : 'solar:double-alt-arrow-up-bold-duotone'
  //       }
  //       sx={{ flexShrink: 0, color: 'success.main', ...(percent < 0 && { color: 'error.main' }) }}
  //     />

  //     <Box component="span" sx={{ typography: 'subtitle2' }}>
  //       {percent > 0 && '+'}
  //       {fPercent(percent)}
  //     </Box>
  //     <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
  //       last 7 days
  //     </Box>
  //   </Box>
  // );

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,

        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ typography: 'subtitle2', display: 'flex', alignItems: 'center', gap: 1, color }}>
          {icon}
          {title}
        </Box>
        <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{total}</Box>
        {/* {renderTrending} */}
      </Box>
    </Card>
  );
}
