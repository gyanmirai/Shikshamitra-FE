'use client';

import type { Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';
import { varAlpha, stylesMode } from 'src/theme/styles';

import type { LabelColor, LabelVariant } from './types';

// ----------------------------------------------------------------------

export const StyledLabel = styled(Box)(({
  theme,
  ownerState: { color, variant },
}: {
  theme: Theme;
  ownerState: {
    color: LabelColor;
    variant: LabelVariant;
  };
}) => {
  const palette = theme.vars?.palette ?? theme.palette;
  const toAlpha = (channel: string | undefined, fallbackColor: string, opacity: number) =>
    channel ? varAlpha(channel, opacity) : alpha(fallbackColor, opacity);

  const defaultColor = {
    ...(color === 'default' && {
      /**
       * @variant filled
       */
      ...(variant === 'filled' && {
        color: palette.common.white,
        backgroundColor: palette.text.primary,
        [stylesMode.dark]: { color: palette.grey[800] },
      }),
      /**
       * @variant outlined
       */
      ...(variant === 'outlined' && {
        backgroundColor: 'transparent',
        color: palette.text.primary,
        border: `2px solid ${palette.text.primary}`,
      }),
      /**
       * @variant soft
       */
      ...(variant === 'soft' && {
        color: palette.text.secondary,
        backgroundColor: toAlpha(theme.vars?.palette.grey['500Channel'], palette.grey[500], 0.16),
      }),
      /**
       * @variant inverted
       */
      ...(variant === 'inverted' && {
        color: palette.grey[800],
        backgroundColor: palette.grey[300],
      }),
    }),
  };

  const styleColors = {
    ...(color !== 'default' && {
      /**
       * @variant filled
       */
      ...(variant === 'filled' && {
        color: palette[color].contrastText,
        backgroundColor: palette[color].main,
      }),
      /**
       * @variant outlined
       */
      ...(variant === 'outlined' && {
        backgroundColor: 'transparent',
        color: palette[color].main,
        border: `2px solid ${palette[color].main}`,
      }),
      /**
       * @variant soft
       */
      ...(variant === 'soft' && {
        color: palette[color].dark,
        backgroundColor: toAlpha(theme.vars?.palette[color].mainChannel, palette[color].main, 0.16),
        [stylesMode.dark]: { color: palette[color].light },
      }),
      /**
       * @variant inverted
       */
      ...(variant === 'inverted' && {
        color: palette[color].darker,
        backgroundColor: palette[color].lighter,
      }),
    }),
  };

  return {
    height: 24,
    minWidth: 24,
    lineHeight: 0,
    cursor: 'default',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    justifyContent: 'center',
    padding: theme.spacing(0, 0.75),
    fontSize: theme.typography.pxToRem(12),
    fontWeight: theme.typography.fontWeightBold,
    borderRadius:
      typeof theme.shape.borderRadius === 'number'
        ? theme.shape.borderRadius * 0.75
        : `calc(${theme.shape.borderRadius} * 0.75)`,
    transition: theme.transitions.create('all', {
      duration: theme.transitions.duration.shorter,
    }),
    ...defaultColor,
    ...styleColors,
  };
});
