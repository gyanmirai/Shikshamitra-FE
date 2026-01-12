import type { Theme, SxProps } from '@mui/material/styles';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Avatar, Typography } from '@mui/material';

import { SubjectColorIndicator } from '../subject-color/SubejctColor';

interface LabelItem {
  name: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'default';
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  bgColor?: string;
  href?: string;
  labels?: LabelItem[];
  description?: string;
  sx?: SxProps<Theme>;
}

export const DashboardCard = ({
  title,
  value,
  icon,
  color = 'primary.main',
  bgColor = 'primary.lighter',
  href = '',
  labels = [],
  description,
  sx,
}: DashboardCardProps) => {
  const theme = useTheme();

  const cardContent = (
    <Card
      sx={{
        p: 2, // Reduced padding for density
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 1.5, // Reduced gap
        height: '100%',
        borderRadius: 2,
        position: 'relative',
        overflow: 'visible',
        boxShadow: theme.customShadows?.z1 || theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          transform: href ? 'translateY(-4px)' : 'none',
          boxShadow: href
            ? theme.customShadows?.z12 || theme.shadows[8]
            : theme.customShadows?.z1 || theme.shadows[1],
          borderColor: href ? 'transparent' : theme.palette.divider,
        },
        cursor: href ? 'pointer' : 'default',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1.5 }}>
        {/* Icon/Avatar */}
        <Avatar
          variant="rounded"
          sx={{
            width: 40,
            height: 40,
            bgcolor: bgColor,
            color,
            borderRadius: 1.5,
          }}
        >
          <Iconify icon={icon} width={24} />
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              mb: 0.25, // Reduced margin
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: '0.7rem', // Slightly smaller
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: -0.5 }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5, mt: 0.5 }}>
          {description}
        </Typography>
      )}

      {labels.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            mt: 'auto',
            pt: 2, // Reduced top padding
            width: '100%',
            borderTop: `1px dashed ${theme.palette.divider}`,
          }}
        >
          {labels.map((label, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <SubjectColorIndicator color={`${label.color}.main`} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {label.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );

  if (href) {
    return (
      <Box
        component={Link}
        href={href}
        sx={{ textDecoration: 'none', display: 'block', height: '100%' }}
      >
        {cardContent}
      </Box>
    );
  }

  return cardContent;
};
