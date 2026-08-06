'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

type PaletteColor = 'primary' | 'warning' | 'success' | 'info' | 'error' | 'secondary' | 'default';

export type MetricCardProps = {
  title: string;
  value: number | string;
  color?: PaletteColor;
  icon: string;
  subtitle?: string;
  selected?: boolean;
  onClick?: () => void;
};

export const MetricCard = ({
  title,
  value,
  color = 'primary',
  icon,
  subtitle,
  selected = false,
  onClick,
}: MetricCardProps) => {
  const theme = useTheme();

  const isDefault = color === 'default';
  const mainColor = isDefault ? theme.palette.text.primary : theme.palette[color].main;
  const lightBg = isDefault
    ? alpha(theme.palette.text.primary, 0.06)
    : alpha(theme.palette[color].main, 0.08);

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: '12px',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        border: selected ? `2px solid ${mainColor}` : `1px solid ${theme.palette.divider}`,
        bgcolor: selected ? lightBg : theme.palette.background.paper,
        boxShadow: selected
          ? `0 6px 20px -8px ${alpha(mainColor, 0.3)}`
          : `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              borderColor: mainColor,
              boxShadow: `0 8px 24px -10px ${alpha(mainColor, 0.35)}`,
            }
          : {},
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: lightBg,
            color: mainColor,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={24} height={24} />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            noWrap
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              display: 'block',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1.2,
              my: 0.25,
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      {selected && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: mainColor,
          }}
        />
      )}
    </Card>
  );
};

export default MetricCard;
