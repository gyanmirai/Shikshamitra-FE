'use client';

import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import NoSsr from '@mui/material/NoSsr';
import { useId, forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = BoxProps & {
  href?: string;
  disableLink?: boolean;
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ width = 40, height = 40, disableLink = false, className, href = '/', sx, ...other }, ref) => {
    const theme = useTheme();

    const gradientId = useId();

    const PRIMARY_LIGHT = theme.vars.palette.primary.light;

    const PRIMARY_MAIN = theme.palette.primary.main;

    const PRIMARY_DARK = theme.vars.palette.primary.dark;

    /*
     * OR using local (public folder)
     * const logo = ( <Box alt="logo" component="img" src={`${CONFIG.site.basePath}/logo/logo-single.svg`} width={width} height={height} /> );
     */

    const logo = (
      <svg
        id="Layer_1"
        // dataname="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 57 55.15"
      >
        <defs>
          <filter
            id="drop-shadow-1"
            x="-15.86"
            y="-16.03"
            width="88"
            height="86"
            filterUnits="userSpaceOnUse"
          >
            <feOffset dx="0" dy="-1" />
            <feGaussianBlur result="blur" stdDeviation="5" />
            <feFlood floodColor="#000" floodOpacity=".25" />
            <feComposite in2="blur" operator="in" />
            <feComposite in="SourceGraphic" />
          </filter>
        </defs>
        <g className="cls-1">
          <path
            className="cls-2"
            d="M57,28.47c0,12.05-7.5,22.35-18.08,26.5-1.32.52-2.76-.43-2.76-1.85v-12.74c0-.38-.31-.68-.68-.68h-13.86c-.38,0-.68.31-.68.68v12.78c0,1.42-1.43,2.37-2.76,1.86C7.54,50.88,0,40.55,0,28.47,0,12.75,12.76,0,28.5,0s28.5,12.75,28.5,28.47Z"
          />
        </g>
      </svg>
    );

    return (
      <NoSsr
        fallback={
          <Box
            width={width}
            height={height}
            className={logoClasses.root.concat(className ? ` ${className}` : '')}
            sx={{ flexShrink: 0, display: 'inline-flex', verticalAlign: 'middle', ...sx }}
          />
        }
      >
        {disableLink ? (
          <Box
            ref={ref}
            width={width}
            height={height}
            className={logoClasses.root.concat(className ? ` ${className}` : '')}
            role="img"
            aria-label="logo"
            sx={{
              flexShrink: 0,
              display: 'inline-flex',
              verticalAlign: 'middle',
              fill: theme.palette.primary.main,
              pointerEvents: 'none',
              ...sx,
            }}
            {...other}
          >
            {logo}
          </Box>
        ) : (
          <Box
            ref={ref}
            component={RouterLink}
            href={href}
            width={width}
            height={height}
            className={logoClasses.root.concat(className ? ` ${className}` : '')}
            aria-label="logo"
            sx={{
              flexShrink: 0,
              display: 'inline-flex',
              verticalAlign: 'middle',
              fill: theme.palette.primary.main,
              ...sx,
            }}
            {...other}
          >
            {logo}
          </Box>
        )}
      </NoSsr>
    );
  }
);
