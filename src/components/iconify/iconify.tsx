'use client';

import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import NoSsr from '@mui/material/NoSsr';
import { Icon, addCollection } from '@iconify/react';

import { iconifyClasses } from './classes';
import { criticalIconCollections } from './critical-icons';

import type { IconifyProps } from './types';

// Resolve critical icons from the application bundle; other names retain the normal API fallback.
criticalIconCollections.forEach((collection) => addCollection(collection));

// ----------------------------------------------------------------------

export const Iconify = forwardRef<SVGElement, IconifyProps>(
  ({ className, width = 20, sx, ...other }, ref) => {
    const baseStyles = {
      width,
      height: width,
      flexShrink: 0,
      display: 'inline-flex',
    };

    const renderFallback = (
      <Box
        component="span"
        className={iconifyClasses.root.concat(className ? ` ${className}` : '')}
        sx={{ ...baseStyles, ...sx }}
      />
    );

    return (
      <NoSsr fallback={renderFallback}>
        <Box
          ref={ref}
          component={Icon}
          className={iconifyClasses.root.concat(className ? ` ${className}` : '')}
          sx={{ ...baseStyles, ...sx }}
          {...other}
        />
      </NoSsr>
    );
  }
);
