import type { TooltipProps } from '@mui/material';

import React from 'react';
import { Fade, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.vars.palette.background.paper,
    color: theme.vars.palette.text.primary,
    boxShadow: theme.shadows[4],
    fontSize: 11,
    p: 0,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.vars.palette.background.paper,
    '&::before': {
      backgroundColor: theme.vars.palette.background.paper,
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
