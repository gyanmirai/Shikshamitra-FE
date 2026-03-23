'use client';

import type { BoxProps } from '@mui/material/Box';

import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import NoSsr from '@mui/material/NoSsr';
import { useTheme } from '@mui/material/styles';
import { RouterLink } from 'src/routes/components';

import { Logo } from './logo';
import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoWithTextProps = BoxProps & {
  href?: string;
  disableLink?: boolean;
};

export const LogoWithText = forwardRef<HTMLDivElement, LogoWithTextProps>(
  ({ width, height = 40, disableLink = false, className, href = '/', sx, ...other }, ref) => {
    const theme = useTheme();

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
        <Box
          ref={ref}
          component={RouterLink}
          href={href}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          aria-label="logo"
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            verticalAlign: 'middle',
            textDecoration: 'none',
            ...(disableLink && { pointerEvents: 'none' }),
            ...sx,
          }}
          {...other}
        >
          <Logo width={height} height={height} disableLink sx={{ mr: 0 }} />
          <Box
            component="span"
            sx={{
              color: theme.palette.primary.main,
              fontFamily: theme.typography.fontFamily,
              fontWeight: 400,
              fontSize: typeof height === 'number' ? height * 0.7 : 28,
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            GyanMirai
          </Box>
        </Box>
      </NoSsr>
    );
  }
);
