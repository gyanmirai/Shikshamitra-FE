import type { Theme, SxProps } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';

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
  density?: 'default' | 'compact';
  valueTypographyProps?: TypographyProps;
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
  density = 'default',
  valueTypographyProps,
  sx,
}: DashboardCardProps) => {
  const theme = useTheme();
  const compact = density === 'compact';
  const { sx: valueSx, ...valueProps } = valueTypographyProps ?? {};

  const cardContent = (
    <Card
      sx={{
        p: compact ? 2 : 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 1,
        height: '100%',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: compact ? 'none' : theme.customShadows?.z1 || theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          transform: href && !compact ? 'translateY(-4px)' : 'none',
          boxShadow: compact
            ? 'none'
            : href
              ? theme.customShadows?.z12 || theme.shadows[8]
              : theme.customShadows?.z1 || theme.shadows[1],
          borderColor: href && !compact ? 'transparent' : theme.palette.divider,
        },
        cursor: href ? 'pointer' : 'default',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: compact ? 'flex-start' : 'center',
          width: '100%',
          gap: compact ? 1 : 2,
        }}
      >
        {/* Icon/Avatar */}
        <Avatar
          variant="rounded"
          sx={{
            width: compact ? 32 : 40,
            height: compact ? 32 : 40,
            order: compact ? 1 : undefined,
            bgcolor: bgColor,
            color,
            borderRadius: 1.5,
          }}
        >
          <Iconify icon={icon} width={compact ? 20 : 28} aria-hidden="true" />
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {compact && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              {title}
            </Typography>
          )}
          <Typography
            variant="h6"
            {...valueProps}
            sx={[
              {
                fontWeight: compact ? 600 : 800,
                color: 'text.primary',
                letterSpacing: compact ? 0 : -0.5,
                mb: 0.25,
                ...(compact && {
                  fontSize: '1.25rem',
                  lineHeight: '28px',
                  fontVariantNumeric: 'tabular-nums',
                  overflowWrap: 'anywhere',
                }),
              },
              ...(Array.isArray(valueSx) ? valueSx : valueSx ? [valueSx] : []),
            ]}
          >
            {value}
          </Typography>

          {!compact && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {title}
            </Typography>
          )}
        </Box>
      </Box>

      {description && (
        <Typography
          variant={compact ? 'caption' : 'body2'}
          sx={{ color: 'text.secondary', lineHeight: 1.5, overflowWrap: 'anywhere' }}
        >
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
            width: '100%',
          }}
        >
          {labels.map((label, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                py: 0.5,
                px: 1,
                borderRadius: 1,
              }}
            >
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
