'use client';

import type { CardProps } from '@mui/material';

import Link from 'next/link';
import React, { useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Grid,
  alpha,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { fShortenNumber } from 'src/utils/format-number';

import { varAlpha } from 'src/theme/styles';
import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';
import { AnalyticsCurrentVisits } from 'src/screens/student/enrollment/dashboard/organization-status';
import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';

import { CalendarView } from 'src/sections/calendar/view';

const CommunicationDashboard = () => (
  <Box>
    <Grid container spacing={2} mt={1}>
      <Grid item xs={12} md={3}>
        <BookingWidgetSummary
          title="Total Announcement"
          percent={2.6}
          total={75}
          icon="mdi:announcement"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <BookingWidgetSummary
          title="Unread Messages"
          percent={2.6}
          total={3}
          icon="ic:baseline-message"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <BookingWidgetSummary
          title="Upcoming Event"
          percent={2.6}
          total={4}
          icon="material-symbols:event"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <BookingWidgetSummary title="Active Survey" percent={2.6} total={4} icon="ri:survey-fill" />
      </Grid>
    </Grid>
    <Typography variant="h6" sx={{ mt: 1 }}>
      Event Calendar
    </Typography>
    <CalendarView />
  </Box>
);

export default CommunicationDashboard;

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: string;
  href?: string;
  color?: string;
  description?: string;
}

export const CommunicationDashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  href = '',
  color = 'success', // Default color
  description,
}) => {
  // Use theme to get color variants if needed
  const theme = useTheme();

  // Generate gradient background
  const getColorValue = (colorKey: string) => {
    // Check if the color exists in theme.vars.palette
    const paletteColor = theme.vars.palette[colorKey as keyof typeof theme.vars.palette];

    if (paletteColor && typeof paletteColor === 'object' && 'main' in paletteColor) {
      return paletteColor.main;
    }

    // Fallback to standard palette if vars.palette fails
    const standardPaletteColor = theme.palette[colorKey as keyof typeof theme.palette];

    if (
      standardPaletteColor &&
      typeof standardPaletteColor === 'object' &&
      'main' in standardPaletteColor
    ) {
      return standardPaletteColor.main;
    }

    // Default fallback
    return theme.palette.primary.main;
  };

  // Generate gradient background
  const gradientBackground = `linear-gradient(to right, ${getColorValue(color)} 0%, ${varAlpha(getColorValue(color), 0)} 100%)`;

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        textDecoration: 'none',
        cursor: href ? 'pointer' : 'default',
        '&:hover': href
          ? {
              boxShadow: 6,
              transform: 'scale(1.02)',
              transition: '0.3s ease-in-out',
            }
          : {},
      }}
      onClick={href ? undefined : () => {}}
    >
      <Card
        sx={{
          py: 3,
          pl: 3,
          pr: 2.5,
          position: 'relative',
          height: '100%',
          overflow: 'hidden', // Ensure the background doesn't overflow
        }}
      >
        {/* Main Content */}
        <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
          <Box sx={{ typography: 'h3' }}>{value}</Box>
          <Typography noWrap variant="subtitle2" component="div" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>
        </Box>

        {/* Icon */}
        <Iconify
          icon={icon}
          sx={{
            top: 24,
            right: 10,
            width: 36,
            height: 36,
            position: 'absolute',
            zIndex: 1,
          }}
        />

        {/* Background Gradient */}
        <Box
          sx={{
            top: -44,
            width: 160,
            zIndex: 0,
            height: 160,
            right: -104,
            opacity: 0.12,
            borderRadius: 3,
            position: 'absolute',
            transform: 'rotate(40deg)',
            background: gradientBackground,
          }}
        />
      </Card>
    </Box>
  );
};

type Props = CardProps & {
  title: string;
  total: number;
  percent?: number;
  icon: string;
};

export function BookingWidgetSummary({ title, percent, total, icon, sx, ...other }: Props) {
  //   const renderTrending = (
  //     <Box gap={0.5} display="flex" alignItems="center" sx={{ typography: 'subtitle2' }}>
  //       <Iconify
  //         width={24}
  //         icon={icon}
  //         sx={{
  //           flexShrink: 0,
  //           color: 'success.main',
  //           ...(percent < 0 && { color: 'error.main' }),
  //         }}
  //       />
  //       <span>
  //         {percent > 0 && '+'}
  //         {fNumber(percent)}
  //       </span>
  //     </Box>
  //   );

  return (
    <Card
      sx={{
        p: 2,
        pl: 3,
        display: 'flex',
        alignItems: 'center',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ color: 'text.secondary', typography: 'subtitle2' }}>{title}</Box>
        <Box sx={{ my: 1.5, typography: 'h3' }}>{fShortenNumber(total)}</Box>
      </Box>

      <Iconify icon={icon} sx={{ width: 90, height: 90 }} />
    </Card>
  );
}
