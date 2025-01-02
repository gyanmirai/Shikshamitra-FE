import type { TooltipProps } from '@mui/material';

import React from 'react';

import { Fade, styled, Tooltip, tooltipClasses } from '@mui/material';

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[4],
    fontSize: 11,
    p: 0,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
    '&::before': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
    },
  },
}));

const CustomTooltip = ({ title, children, sx, ...props }: TooltipProps) => (
  <LightTooltip
    TransitionComponent={Fade}
    TransitionProps={{ timeout: 800 }}
    title={title}
    sx={sx}
    {...props}
  >
    {children}
  </LightTooltip>
);

export default CustomTooltip;
