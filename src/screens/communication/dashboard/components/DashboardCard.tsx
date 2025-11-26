import type { CardProps } from '@mui/material';

import React from 'react';
import Link from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fShortenNumber } from 'src/utils/format-number';
import { Box, Card, Avatar, Typography } from '@mui/material';

import type { TDashboardCardProps } from '../type';

export const CommunicationDashboardCard: React.FC<TDashboardCardProps> = ({
  title,
  value,
  icon,
  href = '',
  color = 'success.main',
  bgColor = 'success.lighter',
  labels = [],
}) => (
  <Box
    component={Link}
    href={href}
    sx={{
      textDecoration: 'none',
    }}
    onClick={href ? undefined : () => {}}
  >
    <Card
      sx={{
        p: 3,
        height: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 2,
        cursor: href ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows?.z8 || 8,
          transform: 'scale(1.02)',
        },
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {labels.map((label, index) => (
            <Label key={index} color={label.color as any}>
              {label.name}
            </Label>
          ))}
        </Box>
      </Box>

      <Avatar
        sx={{
          width: 56,
          height: 56,
          bgcolor: bgColor,
          color,
        }}
      >
        <Iconify icon={icon} width={32} />
      </Avatar>
    </Card>
  </Box>
);

type Props = CardProps & { title: string; total: number; percent?: number; icon: string };

export function BookingWidgetSummary({ title, percent, total, icon, sx, ...other }: Props) {
  return (
    <Card sx={{ p: 2, pl: 3, display: 'flex', alignItems: 'center', ...sx }} {...other}>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ color: 'text.secondary', typography: 'subtitle2' }}>{title}</Box>
        <Box sx={{ my: 1.5, typography: 'h3' }}>{fShortenNumber(total)}</Box>
      </Box>

      <Iconify icon={icon} sx={{ width: 90, height: 90 }} />
    </Card>
  );
}
