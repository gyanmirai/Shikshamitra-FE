'use client';

import type { ReactNode } from 'react';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DefaultPropsProvider from '@mui/system/DefaultPropsProvider';

const drawerDuration = { enter: 240, exit: 180 };

export function StudentDrawerMotionProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const defaults = useMemo(() => {
    const drawer = theme.components?.MuiDrawer;
    return {
      ...theme.components,
      MuiDrawer: {
        ...drawer,
        defaultProps: {
          ...drawer?.defaultProps,
          transitionDuration: reduceMotion ? 0 : drawerDuration,
          slotProps: {
            ...drawer?.defaultProps?.slotProps,
            transition: { appear: true },
          },
        },
      },
    };
  }, [reduceMotion, theme.components]);

  return <DefaultPropsProvider value={defaults}>{children}</DefaultPropsProvider>;
}
